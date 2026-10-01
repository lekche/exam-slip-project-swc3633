const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Pendaftaran semua laluan (Routes)
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/lecturer', require('./routes/lecturer'));
app.use('/student', require('./routes/student'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server sedang berjalan di http://localhost:${PORT}`);
});