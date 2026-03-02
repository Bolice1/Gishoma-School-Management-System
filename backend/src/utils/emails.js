const transporter = require('../config/mialer')


const sendWelcomEmail = async (email, userName) => {
    const mailOptions = {
        from: `Gishoma Management System <${process.env.Email}>`,
        to: email,
        subject: "welcome to Gishoma multi school management system",
        html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #227aa9; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Gishoma Multi School Management System</h1>
                </div>
                <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #333;">Welcome, ${userName}! </h2>
                    <p style="color: #555; font-size: 16px;">I am happy to see you and your school using this platform to boost Rwanda's education</p>
                    <p style="color: #555; font-size: 16px;">Here is what you and your school can do: </p>
                    <ol style="color: #555; font-size: 16px;">
                  <li>Registering students and techers in the system </li>
                        <li>Making daily attandance for both teachers and students</li>
                        <li>Registering student marks in the system and get instant ai driven analysis</li>
                        <li>Students will be able to get theit homeworks,exam,exercises and discipline reports</li>
                        <li>Teachers will be able to share notes,exercises and homeworks to the students</li>
                        <li>Students will be able to do shared exercises and homeworks through their darshboard</li>
                        <li>Instant student reports with ai  analytics </li>
                        <li>School bursar will be able to handle transactions made in the school ecosystem <br>
                        easily and manage payments documents with ease through his portal</li>
                        <li>School dean of studies will be able to handle all the school learning activities <br>
                        and performance of the school through designed graphs and chats which will aid in structured management</li>
                        
    
                    </ol>
                    <h4 style="color: #333">Techinically, this platform offers the following: </h4>
                    <ol style="color: #555; font-size: 16px;">
                        <li>School admin darshboard</li>
                        <li>Teachers darshboard</li>
                        <li>Student darshboard</li>
                        <li>School bursar darshboard</li>
                        <li>Dean of studies darshboard<li>

                    </ol>
                    
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
                        If you didn't create this account, please ignore this email.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`The invitation email was sent to ${email}`);
    } catch (error) {
        console.log(`Error occured while sending invitation email to ${email} \n ${error}`)
    }
};

const sendResetPasswordEmail = async (email, userName, resetToken) => {
    const resetLink = `http://localhost:5000/api/reset-password/${resetToken}`;
    const mailoptions = {
        from: `Gishoma Multi School Management System <${process.env.Email}>`,
        to: email,
        subject: "Reset password ",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #227aa9; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Reset password</h1>
                </div>
             <p>Your reset password token is<br> 
             <div style="color: black,spacing: 3px,border: solid green 2px,border-radius: 4px">${resetToken}
              </div>
             <br>Or click on the button below to directly reset it<br>
             <button style="background-color: #09212d, width: 3em,spacing:2px,text-decoration:none">
             <a href= ${resetLink}>
             </button>
                
             
             
            </div>
        
        
        `
    };

    try {
        await transporter.sendMail(mailoptions)

        console.log(`Reset password email sent to ${email}`)

    } catch (error) {
        console.log(`Error occured while sending reset password email to ${email}\n ${error}`)
    }

}



module.exports = { sendResetPasswordEmail, sendWelcomEmail };