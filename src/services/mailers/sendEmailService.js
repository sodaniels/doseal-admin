const { Log } = require("../../helpers/Log");
const nodemailer = require("nodemailer");

async function postEmail(_to) {
	Log.info(`[sendEmailService.js][postEmail]\t .. incoming email request`);

	let transporter = nodemailer.createTransport({
		service: process.env.SERVICE,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL,
		to: _to,
		subject: "Zeemoney App Alerts",
		html: mailBody(),
	};

	try {
		const info = await transporter.sendMail(mailOptions);

		console.log("Message sent: %s", info.messageId);
	} catch (error) {
		console.error("Error sending email:", error);
	}
}

const mailBody = () => `<!DOCTYPE html>
  <html lang="en">
  <head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>New User Registration</title>
	<style>
	  body {
		font-family: 'Arial', sans-serif;
	  }
	  .container {
		max-width: 600px;
		margin: 0 auto;
	  }
	  .header {
		background-color: #4CAF50;
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
	  <div class="header">
		<h1>New job is assigned to you.</h1>
	  </div>
	  <div class="content">
		<p>
		 A new job has been assigned to you and your team. Kindly login to the Tebel portal and access the job.
		</p>
		
  
	  </div>
	  <div class="footer">
		<p>Thank you for your prompt action.</p>
		<p>
		  Best regards,<br>
		  Tebel Automated Alerts<br>
		</p>
	  </div>
	</div>
  </body>
  </html>`;

module.exports = {
	postEmail,
};
