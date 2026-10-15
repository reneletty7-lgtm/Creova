const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit",function(event) {
 event.preventDefault();
 const contact = document.getElementById("loginContact").value;
    const password = document.getElementById("loginPassword").value;

    const savedUser = JSON.parse(
        localStorage.getItem("creovaUser")
    );

    if (!savedUser) {
        alert("No account found. Please register first.");
        return;
    }
if (contact === savedUser.contact && password === savedUser.password) {
        alert("Login successful! Welcome back, " + savedUser.name);
        window.location.href = "home.html";
    } else {
        alert("Incorrect email/phone number or password.");
    }
});
