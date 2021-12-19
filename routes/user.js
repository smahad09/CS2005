const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const sql = require('mysql');
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdb'
});


const requireLogin = (request,response,next)=> {
    if (!request.session.userId) {
        response.redirect('/login');
        return;
    }
    next();
}

const isLoggedIn = (request,response,next)=> {
    if (request.session.userId) {
        request.flash('success', 'You are already logged in!');
        response.redirect('/');
        return;
    }
    next();
}

router.get('/login', isLoggedIn, (request,response)=> {
    response.render('login');
})

router.get('/hidden', requireLogin, (request,response)=> {
    response.send("You can only see me if you are logged in");
})

router.post('/login', isLoggedIn, async(request,response)=> {
    let user = request.body;
    conn.query('select * from users where email = ?', [user.email], async (error, results) => {
        if (error)
            console.log('there is error');
        else {
            if (results.length >= 1) {
                const result = await bcrypt.compare(user.userPassword, results[0].userPassword);
                if (result) {
                    user = results[0];
                    console.log('logged in');
                    request.session.userId = user.userId;
                    request.flash('success', 'Welcome Back');
                    response.redirect('/products');
                    return;
                }
                else {
                    console.log('failed');
                    request.flash('error', 'invalid email or password');
                    response.redirect('/login');
                    return;
                }
            }
        }
    })
})

router.get('/register', isLoggedIn, (request,response)=> {
    response.render('register');
})

router.post('/register', isLoggedIn, async(request,response)=> {
    const user = request.body;

    let isNum = /^[+]?[0-9]+$/.test(user.phone);
    if (!isNum) {
        request.flash('error', 'Phone Number Must Contain Only Digits');
        response.redirect('/register');
        return;
    }

    if (user.userPassword.length<=5) {
        request.flash('error', 'Password Should Be Greater Than 5 Characters');
        response.redirect('/register');
        return;
    }

    user.userPassword = await bcrypt.hash(user.userPassword, 12);
    conn.query('insert into users set ?', user, (error, results) => {
        if (error) {
            let message = 'Something Went Wrong';
            if (error.errno==1062) {message = 'Account Already Exists'};
            request.flash('error', `${message}`);
            response.redirect('/register');
        }
        else {
            console.log(results);
            request.flash('success', 'Account Successfully Created');
            response.redirect('/products');
        }
    })
})

router.delete('/:reviewId/deleteReview', requireLogin, (request,response)=> {
    const {reviewId} = request.params;
    const userId = request.session.userId;
    let id = {};
    conn.query('select * from reviews where reviewId=?',[reviewId], (error,results)=> {
        if (error) throw error;
        id.productId = results[0].productId;
    })
    conn.query('delete from reviews where reviewId=? AND userId=?', [reviewId,userId], (error,results,fields)=> {
        if (error) response.send(error);
        else {
            request.flash('success', 'Review Deleted Successfully');
            response.redirect(`/products/${id.productId}`);
        }
    })
})

router.post('/logout', (request,response)=> {
    delete request.session.userId;
    request.flash('success', 'You are logged Out');
    response.redirect('/');
})


module.exports = router;