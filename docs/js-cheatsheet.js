// js cheatsheet

// 1. Variables
// 2. Data Types
// 3. Arrays
// 4. Objects
// 5. Functions
// 6. Conditionals
// 7. Loops
// 8. References
// 9. Spread Operator
// 10. Destructuring
// 11. Classes
// 11.1. Inheritance
// 11.2. Static Methods
// 11.3. Getters and Setters
// 11.4. this keyword
// 12. Promises
// 12.1. async/await
// 12.2. callback hell
// 12.3. promises


// 1. Variables

// var (old way, function scoped)
function hello() {
  if (true)
    var world = "world";
  console.log(world); // world
}

// let (new way, block scoped, reassignable)
let number = 1;
let word;

word = "hello";

{
  let letter = "c";
}
console.log(letter); // undefined

// const (new way, block scoped, not reassignable)
const a; // error
const b = 1;
b = 2; // error

// 2. Data Types

// Number
let number = 1;
let number = 1.5;

// String
let word = "hello";
let word = 'hello';

// Boolean
let bool = true;
let bool = false;

// nullables
let nothing = null;
let nothing = undefined;

// 3. Arrays
let list = [1, 2, 3];
let list = ["a", "b", "c"];
let list = [1, "a", true];

// 4. Objects
let obj = {
  name: "John",
  age: 30,
  isMarried: false
};

console.log(obj.name); // John
console.log(obj["name"]); // John
const objKey = "name";
console.log(obj[objKey]); // John

// 5. Functions

// function declaration
function hello() {
  console.log("hello");
}

// function expression
const hello = function() {
  console.log("hello");
}

// arrow function
const hello = () => {
  console.log("hello");
}

// inline arrow function
const hello = () => console.log("hello");

// 6. Conditionals
// if/else/else if/switch/case/break/continue/return/ternary

// 7. Loops
// for/while/do while

const list = [1, 2, 3, 4, 5];

// for of loop

for (let item of list)
  console.log(item); // 1 2 3 4 5

// for in loop

for (let index in list)
  console.log(index); // 0 1 2 3 4

for (let key in obj)
  console.log(key); // name age isMarried

// 7. references

let test = 1;

function mutate(number, isObj = false) {
  if (isObj)
    number.number = 2;
  else
    number = 2;
}

mutate(test);
console.log(test); // 1

let test = { number: 1 };

mutate(test, true);

console.log(test.number); // 2

// 8. spread operator

const list = [1, 2, 3];
const list2 = [4, 5, 6];

const list3 = [...list, ...list2];

console.log(list3); // [1, 2, 3, 4, 5, 6]

const obj = { name: "John" };
const obj2 = { age: 30 };

const obj3 = { ...obj, ...obj2 };

console.log(obj3); // { name: "John", age: 30 }

const obj = { name: "John", work: { name: "developer" } };

const shallowCopy = { ...obj };

shallowCopy.name = "Joanna";
shallowCopy.work.name = "designer";

console.log(obj); // { name: "John", work: { name: "designer" } }

const deepCopy = { ...obj, work: { ...obj.work } };

deepCopy.name = "Joanna";
deepCopy.work.name = "designer";

console.log(obj); // { name: "John", work: { name: "developer" } }

// 9. destructuring

const list = [1, 2, 3];

const [a, b, c] = list;

console.log(a, b, c); // 1 2 3

const [a, ...rest] = list;

console.log(a, rest); // 1 [2, 3]

const obj = { name: "John", age: 30 };

const { name, age } = obj;

console.log(name, age); // John 30

const { name: firstName, age: userAge } = obj;

console.log(firstName, userAge); // John 30

// 10. classes

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  sayHello() {
    console.log("hello");
  }
}

const john = new Person("John", 30);

console.log(john.name); // John
console.log(john.age); // 30
john.sayHello(); // hello

// 10.1. inheritance

class Worker extends Person {
  job;

  constructor(name, age, job) {
    super(name, age);
    this.job = job;
  }

  sayHello() {
    super.sayHello();
    console.log("hello from worker");
  }
}

const john = new Worker("John", 30, "developer");

console.log(john.name); // John
console.log(john.age); // 30
console.log(john.job); // developer

john.sayHello(); // hello\nhello from worker

// 10.2. static methods

class Person {
  static sayHello() {
    console.log("hello");
  }
}

Person.sayHello(); // hello

// 10.3. getters and setters

class Person {
  _name;

  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    if (value.length < 3)
      console.log("name is too short");
    else
      this._name = value;
  }
}

const john = new Person("John");

console.log(john.name); // John

john.name = "Jo";

console.log(john.name); // John

john.name = "Joanna";

console.log(john.name); // Joanna

// 10.4. this keyword

const person = new Person("John");

function sayHelloWithPerson() {
  console.log(this.name);
}

sayHelloWithPerson(); // undefined

const boundSayHelloWithPerson = sayHelloWithPerson.bind(person);

boundSayHelloWithPerson(); // John

const sayHelloWithPerson = () => {
  console.log(this.name);
}

sayHelloWithPerson(); // undefined

const boundSayHelloWithPerson = sayHelloWithPerson.bind(person);

boundSayHelloWithPerson(); // undefined

// 11. promises

const promise = new Promise((resolve) => setTimeout(() => resolve("hello"), 1000));

promise.then((value) => console.log(value)); // hello after 1 second

// 11.1. async/await

async function hello() {
  const value = await promise;
  console.log(value);
}

hello(); // hello after 1 second but function returns immediately

// callback hell

function getPerson(id, callback) {
  setTimeout(() => {
    callback({ id: id, name: "John" });
  }, 1000);
}

function getJob(person, callback) {
  setTimeout(() => {
    callback({ name: "developer" });
  }, 1000);
}

function getSalary(job, callback) {
  setTimeout(() => {
    callback({ salary: 1000 });
  }, 1000);
}

getPerson(1, (person) => {
  getJob(person, (job) => {
    getSalary(job, (salary) => {
      console.log(salary);
    });
  });
}); // { salary: 1000 } after 3 seconds

// promises

function getPerson(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: id, name: "John" });
    }, 1000);
  });
}

function getJob(person) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ name: "developer" });
    }, 1000);
  })
}

function getSalary(job) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ salary: 1000 });
    }, 1000);
  })
}

async function getSalaryFromPerson(id) {
  const person = await getPerson(id);
  const job = await getJob(person);
  const salary = await getSalary(job);
  console.log(salary);
}

getSalaryFromPerson(1); // { salary: 1000 } after 3 seconds