const nodemailler = require('nodemailer')
require('dotenv').config()

const transporter = nodemailler.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})
// VERIFY TRANSPORTER ON STARTUP 

transporter.verify((error)=>{
   error?console.log(`Error occured: ${error}`):console.log('Mailer ready 📪')
});

module.exports = transporter;
