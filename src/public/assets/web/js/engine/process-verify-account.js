$(document).ready(function () {
	$("#procesContactForm").click(function (e) {
		e.preventDefault();
		$.ajaxSetup({
			headers: {
				"X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
			},
		});

		var $button = $(this);

		let code = "";
		$(".verification-inputs input").each(function () {
			code += $(this).val();
		});

		if (code === "" || code === undefined) {
			Swal.fire({
				title: "Enter verification code",
				text: "Please enter verification code",
				icon: "warning",
			});
			return false;
		}

		if (code.length != 6) {
			Swal.fire({
				title: "Invalid Code",
				text: "The verification code must be 6 characters",
				icon: "warning",
			});
			return false;
		}

		const phoneNumber = localStorage.getItem("phoneNumber");
		const email = localStorage.getItem("email");

		const userData = {
			phoneNumber: phoneNumber,
			email: email,
			code: code,
		};

		$("#loadingOverlay").css("display", "flex");

		$(this).prop("disabled", true);
		$(this).text("Confirming Code...");

		jQuery.ajax({
			url: "../../verify-account",
			method: "post",
			data: userData,

			success: function (result) {
				console.log(result);

				$("#loadingOverlay").css("display", "none");

				$button.prop("disabled", false);
				$button.html('<i class="la la-send"></i> Submit');

				if (result.code === 200) {
					window.location.href = `complete-registration?token${result.token}`;
				} else if (result.code === 400) {
					Swal.fire({
						title: "Invalid Code",
						text: "The code was not valid. Please check your email and enter the correct code.",
						icon: "warning",
					});
					return false;
				} else {
					$("#loadingOverlay").css("display", "none");
					Swal.fire({
						title: "An error occurred !!",
						text: "An error occurred. please try again",
						icon: "warning",
					});
					return false;
				}
			},
		});
	});
});
