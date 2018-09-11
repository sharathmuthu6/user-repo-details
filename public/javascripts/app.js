function validateForm() {
    let x = document.forms["gitusers"]["username"].value;
    if (x.trim() == "") {
        alert("Username must be filled out");
        return false;
    }
}