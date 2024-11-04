const { Log } = require("../../helpers/Log");
const nodemailer = require("nodemailer");

async function postEmail(email, message) {
	Log.info(
		`[sendEmailForLoginService.js][postEmail]\t .. incoming email request`
	);

	let transporter = nodemailer.createTransport({
		service: process.env.SERVICE,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	});

	const mailOptions = {
		from: `Doseal Limited <${process.env.EMAIL}>`,
		to: email,
		subject: "Doseal Notifications",
		html: mailBody(message),
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log("Message sent: %s", info.messageId);
		return info;
	} catch (error) {
		console.error("Error sending email:" + error);
	}
}

const mailBody = (message) => `<!DOCTYPE html>
  <html lang="en">
  <head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Login OTP</title>
	<style>
	  body {
		font-family: 'Arial', sans-serif;
	  }
	  .container {
		max-width: 600px;
		margin: 0 auto;
	  }
	  .header {
		background-color: #000000;
		color: #fff;
		padding: 15px;
		text-align: center;
	  }
	  .content {
		padding: 20px;
	  }
	  .footer {
		background-color: #f2f2f2;
		padding: 8px;
		text-align: center;
	  }
	</style>
  </head>
  <body>
	<div class="container">
	  
	  <div class="content">
		<h3>
       	 ${message}
      	</h3>
  
	  </div>
	  <div class="footer">
		<p>
		  Yours faithful,<br>
		  Doseal Limited<br>
		</p>
	  </div>
	</div>
  </body>
  </html>`;

module.exports = {
	postEmail,
};
