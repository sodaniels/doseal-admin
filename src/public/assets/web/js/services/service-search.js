$(document).ready(function () {
	$("#signUpBtn").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		var phoneNumber = $("#phoneNumber").val();
		var email = $("#email").val();
		var password = $("#password").val();
		var confirmPassword = $("#confirmPassword").val();

		let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


		if (phoneNumber === "" || phoneNumber === undefined) {
			Swal.fire({
				title: "Enter Phone Number",
				text: "Please enter a phone number",
				icon: "warning",
			});
			return false;
		}

	
		const userData = {
			phoneNumber: phoneNumber,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Please wait...");

		jQuery.ajax({
			url: "../../search-ecg-meter",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

				if (result.code === 409) {
					const errorMessages = errors
						.map((error) => `${error.field}: ${error.message}`)
						.join("\n");

					Swal.fire({
						title: "Validation Error",
						text: errorMessages,
						icon: "error",
					});
					return false;
				}

				if (result.code === 401) {
					Swal.fire({
						title: "Security Check !!",
						text: "Please click the 'I'm not a robot checkbox' to proceed",
						icon: "warning",
					});
					return false;
				}

				if (result.code === 402) {
					Swal.fire({
						title: "Account Exist!",
						text: result.message,
						icon: "warning",
					});
					return false;
				}

				if (result.code === 200) {
					window.location.href = "verify-account";
				} else {
					if (result.code === 406) {
						$("#loadingOverlay").css("display", "none");
						Swal.fire({
							title: "An error occurred !!",
							text: "An error occurred. please try again",
							icon: "warning",
						});
						return false;
					}
				}
			},
		});
	});
});
