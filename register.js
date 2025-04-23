document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("RForm")
  const usernameInput = document.getElementById("username")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const dobInput = document.getElementById("dob")
  const togglePasswordButton = document.getElementById("togglePassword")
  const registerButton = document.getElementById("register_btn")
  //const formMessage = document.getElementById("form-message")

  // Toggle password visibility
  togglePasswordButton.addEventListener("click", function () {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    // Toggle eye icon
    const eyeIcon = this.querySelector("svg")
    if (type === "password") {
      eyeIcon.innerHTML =
        '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>'
    } else {
      eyeIcon.innerHTML =
        '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line>'
    }
  })

  // Form validation
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission

    if (validateForm()) {
        registerButton.disabled = true;
        registerButton.textContent = "Registering...";

        const formData = new FormData(form);

        fetch('/register', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (response.ok) {
                // Registration successful
                alert('Registration successful!');
                window.location.href = '/'; // Redirect to homepage
            } else if (response.status === 409) {
                // Handle duplicate email error
                response.text().then(errorMessage => alert(errorMessage));
            } else {
                throw new Error('Failed to register. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        })
        .finally(() => {
            registerButton.disabled = false;
            registerButton.textContent = "Register";
        });
    }
});

  

  // Input validation on blur
  emailInput.addEventListener("blur", validateEmail)
  passwordInput.addEventListener("blur", validatePassword)
  usernameInput.addEventListener("blur", validateUsername)
  dobInput.addEventListener("blur", validateDob)

  // Validation functions
  function validateForm() {
    const isUsernameValid = validateUsername()
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    const isDobValid = validateDob()

    return isUsernameValid && isEmailValid && isPasswordValid && isDobValid
  }

  function validateUsername() {
    const username = usernameInput.value.trim()
    const usernameError = document.getElementById("username-error")

    if (username === "") {
      showError(usernameInput, usernameError, "Username is required")
      return false
    } else if (username.length < 3) {
      showError(usernameInput, usernameError, "Username must be at least 3 characters")
      return false
    } else if (username.length > 9) {
      showError(usernameInput, usernameError, "Username must not exceed 9 characters")
      return false
    } else {
      showError(usernameInput, usernameError, "")
      return true
    }
  }

  function validateEmail() {
    const email = emailInput.value.trim()
    const emailError = document.getElementById("email-error")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (email === "") {
      showError(emailInput, emailError, "Email is required")
      return false
    } else if (!emailRegex.test(email)) {
      showError(emailInput, emailError, "Please enter a valid email address")
      return false
    } else {
      showError(emailInput, emailError, "")
      return true
    }
  }

  function validatePassword() {
    const password = passwordInput.value
    const passwordError = document.getElementById("password-error")

    if (password === "") {
      showError(passwordInput, passwordError, "Password is required")
      return false
    } else if (password.length < 8) {
      showError(passwordInput, passwordError, "Password must be at least 8 characters")
      return false
    } else if (!/[A-Z]/.test(password)) {
      showError(passwordInput, passwordError, "Password must contain at least one uppercase letter")
      return false
    } else if (!/[a-z]/.test(password)) {
      showError(passwordInput, passwordError, "Password must contain at least one lowercase letter")
      return false
    } else if (!/[0-9]/.test(password)) {
      showError(passwordInput, passwordError, "Password must contain at least one number")
      return false
    } else {
      showError(passwordInput, passwordError, "")
      return true
    }
  }

  function validateDob() {
    const dob = dobInput.value
    const dobError = document.getElementById("dob-error")

    if (dob === "") {
      showError(dobInput, dobError, "Date of birth is required")
      return false
    } else {
      const birthDate = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        showError(dobInput, dobError, "You must be at least 18 years old")
        return false
      } else {
        showError(dobInput, dobError, "")
        return true
      }
    }
  }

 function showError(input, errorElement, message) {
    if (message) {
      errorElement.textContent = message
      input.classList.add("error")
    } else {
      errorElement.textContent = ""
      input.classList.remove("error")
    }
  }

 /* function showFormMessage(message, type) {
    formMessage.textContent = message
    formMessage.className = "form-message"
    formMessage.classList.add(type)
  }*/
})