const express = require('express');
const router = express.Router();
const moment = require('moment');

const sql = require('mysql');
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdb',
    multipleStatements: true
});


router.get('/', (request,response)=> {
    conn.query('select * from products', (error, results) => {
        if (error)
            throw error;
        else {
            response.render('products', { data: results });
            return;
        }
    })
});

//individual show page of a perfume
router.get('/:id', (request,response)=> {
    const {id} = request.params;
    conn.query('select * from products where productId = ?', [id], (error, results) => {
        if (error) throw error;
        else {
            const perfume = results[0];
            conn.query(`select * from reviews where productId= ${results[0].productId}`, (error,results)=> {
                if (error) throw error;
                else {
                    response.render('show', {perfume, reviews: results});   
                }
            });
        }
    })
});

router.get('/:id/buy', (request,response)=> {
    const {id} = request.params;
    const userId = request.session.userId;
    if (!userId) {
        console.log('You need to login first');
        request.flash('error', 'You need to login First');
        response.redirect('/login');
        return;
    } else {
        conn.query('select * from products where productId= ?; select email,city,state,street,fname,lname,phone from users where userId=?', [id,userId], (error,results)=> {
            if (error) throw error;
            const productDetails = results[0][0]; const userDetails = results[1][0];
            response.render('buy', {userDetails, productDetails});
            return;
        })
    }
})

router.post('/:id/buy', (request,response)=> {
    const myOrder = request.body;
    const {id} = request.params;
    const orderDate = moment().format('YYYY/MM/DD');
    myOrder.orderDate = orderDate;
    myOrder.userId = request.session.userId;
    myOrder.productId = id;
    conn.query("insert into `orders` set ?, `amount`=(select price from products where productId=?)", 
               [myOrder, id], (error,results)=> {
                if (error) throw error;
                else {
                    conn.query('update products set quantity = quantity -1 where productId = ?', [id]);
                    myOrder.orderId = results.insertId;
                    delete myOrder.userId; delete myOrder.productId;
                    response.render('purchased', {myOrder});
                    return;
                }
            })
})

module.exports = router;