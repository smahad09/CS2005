if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/products');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static('assets'));
app.use(express.static(path.join(__dirname,'assets')));


const sql = require('mysql');
const conn = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'projectdb'
});

const sessionConfig = {
    name: 'session',
    secret: 'this is a secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 3),
        maxAge: 1000 * 60 * 60 * 24 * 1
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use((request,response,next)=> {
    response.locals.isAdmin = request.session.adminId;
    response.locals.currentUser = request.session.userId;
    response.locals.success = request.flash('success');
    response.locals.error = request.flash('error');
    next();
})

app.get('/', (request,response)=> {
    response.render('home');
});

app.use('/admin', adminRoutes);
app.use('/', userRoutes);
app.use('/products', productRoutes);

app.post('/search', (request,response)=> {
    const {term} = request.body;
    conn.query(`select * from products where productName like "%${term}%"`, (error,results)=> {
        if (error) response.send(error);
        else {
            response.render('results', {data: results});
        }
    })
})

app.get('*', (request,response)=> {
    response.send('page not found');
})

app.listen(3000, ()=> {
    console.log('Serving on Port 3000');
});