const data = {
    newUser: {
        email: `${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)}@mymail.com`,
        name: "Anna Kowalska",
        password: "secretpass",
        password2: "secretpass",
    },
    alreadyRegisteredUser: {
        email: `a@a.pl`,
        name: "Anna Kowalska",
        password: "secretpass",
        password2: "secretpass",
    }
}

module.exports = data