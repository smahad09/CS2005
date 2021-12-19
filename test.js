// const express = require('express');
// const app = express();
// const ejsMate = require('ejs-mate');
// const path = require('path');
// const methodOverride = require('method-override');
// const bcrypt = require('bcrypt');
// const session = require('express-session');
// const flash = require('connect-flash');

// app.engine('ejs', ejsMate);
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride('_method'));

const sql = require('mysql');
const { request } = require('http');
const { response } = require('express');
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdb'
});


// const userId = 7;
// const productId = 1;
// const moment = require('moment');
// //INSERT INTO `orders`(`productId`, `userId`, `amount`, `address`, `orderDate`) VALUES (9,6,(select price from products where productId=9),(select street from users where userId=6),"2021-Dec-12");
// const date = '12-DEC-21';
// conn.query("INSERT INTO `orders`(`productId`, `userId`, `amount`, `address`, `orderDate`) VALUES (?,?,(select price from products where productId=?),(select street from users where userId=?),'2021-Dec-12')", [productId, userId, productId, userId], (error,results)=> {
//     if(error) throw error;
//     console.log(results);
// })


// const sessionConfig = {
//     name: 'session',
//     secret: 'this is a secret',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         httpOnly: true,
//         expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
//         maxAge: 1000 * 60 * 60 * 24 * 1
//     }
// };

// app.use(session(sessionConfig));
// app.use(flash());


// let adminUser = false;

// app.use((request, response, next) => {
//     response.locals.isAdmin = adminUser;
//     next();
// })


// app.get('/login', (request,response)=> {    
//     response.render('adminLogin');
// })

// app.post('/admin/login', (request,response)=> {
//     const user = request.body;
//     let result = false;
//     conn.query('select * from admins where username = ?', [user.username], async(error,results)=> {
//         if (error) throw error;
//         if (results.length>=1) {
//             console.log(`${user.pwd}  ++++  ${results[0].pwd}`)
//             result = await bcrypt.compare(user.pwd, results[0].pwd);
//         }
//         else {
//             response.send('User not found');
//             return;
//         }
//         console.log(adminUser);
//         if (result) {
//             adminUser = true;
//             console.log(adminUser);
//         }  
//         if (adminUser) {
//             console.log(adminUser);
//             response.send('Welcome Admin');
//             return;
//         }
//         else {
//             response.send("Wrong pwd");
//             return;
//         }
//     })
// })

// const requireRights = (request,response,next)=> {
//     console.log(adminUser);
//     if (!adminUser) {
//         response.render('hidden');
//         return;
//     }
//     next();
// }

// app.get('/secret', requireRights, (request,response)=> {
//     response.render('hidden');
// })

// app.listen(5000, ()=> {
//     console.log('connected');
// })

const moment = require('moment');
console.log(moment().format('YYYY/MM/DD'));
const time = moment().format('YYYY/MM/DD');
console.log(time);


