const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {format} = require('../middleware');
const multer = require('multer');
const {cloudinary,storage} = require('../cloudinary/config')
const upload = multer({storage});

//write functionalaties


const sql = require('mysql');
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdb'
});


requireRights = (request,response,next)=> {
    request.session.returnTo = request.originalUrl;
    if (!request.session.adminId) {
        console.log("User is not admin");
        response.redirect('/admin/login');
        return;
    }
    next();
};

router.get('/createadmin', requireRights, (request,response)=> {
    response.render('newAdmin');
})

router.post('/createadmin', requireRights, async(request,response)=> {
    const newAdmin = request.body;
    newAdmin.pwd = await bcrypt.hash(newAdmin.pwd, 12);
    conn.query('insert into admins set ?', newAdmin, (error,results)=> {
        if (error) throw error;
        else {
            request.session.adminId = newAdmin.adminId;
            response.send('welcome new admin')
        }
    })
})

router.get('/login', (request,response)=> {
    response.render('adminLogin');
})

router.post('/login', (request,response)=> {
    let admin = request.body;
    let result = false;
    conn.query('select * from admins where username = ?', [admin.username], async(error,results)=> {
        if (error) throw error;
        if (results.length>=1) {
            result = await bcrypt.compare(admin.pwd, results[0].pwd);
        } else {
            response.send('Admin not found');
            return;
        }
        if (result) {
            admin = results[0];
            request.session.adminId = admin.adminId;
            const redirectUrl = request.session.returnTo || '/products';
            response.redirect(redirectUrl);
            return;  
        }  else {
            console.log('Wrong Password');
            response.redirect('/admin/login');
            return;
        }
    })
})

router.get('/logout', (request,response)=> {
    delete request.session.adminId;
    response.redirect('/login');
})

//form to add perfumes 
router.get('/add', requireRights, (request,response)=> {
    response.render('new');
});

//add a new perfume
router.post('/new', requireRights, upload.single('image'), async(request,response)=> {
    let newPerfume = request.body;
    newPerfume = format(newPerfume);
    newPerfume.product_image = request.file.path;
    newPerfume.imageFileName = request.file.filename;
    if (newPerfume.price <= 0) {
        await cloudinary.uploader.destroy(newPerfume.imageFileName);
        request.flash('error', "Price is formatted incorrectly");
        response.redirect('/admin/add');
        return;
    }
    if (newPerfume.quantity <= 0) {
        await cloudinary.uploader.destroy(newPerfume.imageFileName);
        request.flash('error', "Quantity cannot be negative");
        response.redirect('/admin/add');
        return;
    }

    conn.query('insert into products set ?', newPerfume, (error, results) => {
        if (error)
            throw error;
        else {
            request.flash('success', 'Product Successfully Created');
            response.redirect('/products');
            return;
        }
    })
});

router.put('/products/:id',  requireRights, upload.single('image'), async(request,response)=> {
    const {id} = request.params;
    let newPerfume = request.body;
    newPerfume = format(newPerfume);

    conn.query('select * from products where productId =?', [id], async(error,results)=> {
        if (error) throw error;
        else {
            try {
                await cloudinary.uploader.destroy(results[0].imageFileName);
            } catch (err) {
                console.log("There was an error deleting pic from cloud")
            }
        }
    });
    newPerfume.product_image = request.file.path;
    newPerfume.imageFileName = request.file.filename;

    if (newPerfume.price <= 0) {
        await cloudinary.uploader.destroy(newPerfume.imageFileName);
        request.flash('error', "Price is formatted incorrectly");
        response.redirect(`/admin/products/${id}/update`);
        return;
    }
    if (newPerfume.quantity <= 0) {
        await cloudinary.uploader.destroy(newPerfume.imageFileName);
        request.flash('error', "Quantity cannot be negative");
        response.redirect(`/admin/products/${id}/update`);
        return;
    }

    conn.query('update products set productName=?, product_image=?, description=?, quantity=?, price=?, cat_id=?, product_image=?, imageFileName=? where productId=?',
        [newPerfume.productName, newPerfume.product_image, newPerfume.description, newPerfume.quantity, newPerfume.price, newPerfume.cat_id, newPerfume.product_image, newPerfume.imageFileName, id],
        (error, results) => {
            if (error)
                throw error;
            else {
                request.flash('success', 'Product Successfully updated');
                response.redirect(`/products/${id}`);
                return;
            }
        })
})

router.get('/products/:id/update', requireRights, async(request,response)=> {
    const {id} = request.params;
    conn.query('select * from products where productId = ?', [id], (error, results) => {
        if (error)
            throw error;
        else {
            const perfume = results[0];
            response.render('update', { perfume });
            return;
        }
    })
})

//to delete an individual perfume 
router.delete('/products/:id', requireRights, (request,response)=> {
    const {id} = request.params;
    conn.query('update orders set productId=null where productID=?', [id]);
    conn.query('update reviews set productId=null where productId=?',[id]);
    conn.query('select * from products where productId=?', [id], async(error,results)=> {
        if (error) throw error;
        try {
            await cloudinary.uploader.destroy(results[0].imageFileName);
        } catch(err) {
            console.log(err);
        }
    })
    conn.query('delete from products where productID=?',[id], (error,results)=> {
        if (error) throw error;
        else {
            request.flash('success', 'Product deleted successfully');
            response.redirect('/products');
            return;
        }
    });
    
});

router.post('/:id/reviews', (request,response)=> {
    let review = request.body;
    const {id} = request.params;
    const userId = request.session.userId;
    review.userId = userId;
    review.productId = id;
    conn.query('select fname,lname from users where userId =?', [userId], (error,results)=> {
        if (error) response.send(error);
        else {
            review.fname = results[0].fname;
            review.lname = results[0].lname;
            review.userId = parseInt(review.userId); review.productId = parseInt(review.productId); review.rating = parseInt(review.rating);
            conn.query('insert into reviews set ?', review, (error,results)=> {
                if (error) response.send(error);
                else {
                    response.redirect(`/products/${id}`);
                }
            })
        }
    });
})

router.get('/orders', requireRights, (request,response)=> {
    conn.query('select * from orders', (error,results)=> {
        if (error) throw error;
        else {
            response.render('orders', {data:results});
        }
    })
})

module.exports = router;