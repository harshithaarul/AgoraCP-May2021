let name = "Harshitha"
let age = 21;
const interest = 0.3

let person = {
    name: "Harshitha",
    age: 21,

}

console.log(person.name)
let choice = 'name'
console.log(person[choice])

if (age === 21) {
    console.log("is of legal age")
}

function welcome(name) {
    console.log("Hello " + name)
}

function adder(n1, n2) {
    return n1 + n2
}

console.log(adder(2, 3))

welcome("Harshi")