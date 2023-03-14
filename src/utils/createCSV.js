
const itemsArray = [
    { itemRef1: "Item 001" },
    { itemRef2: "Item 002" },
    { itemRef3: "Item 003" }
];

let values = []

itemsArray.forEach(obj => {
    Object.entries(obj).map(([key, value]) => {
        console.log(key, value);
        values.push([key, value])  
    })
})

const csvString = [
    [
        "Source Account",
        "total Funds"
    ],
    ...values
]
let csvContent = "data:text/csv;charset=utf-8," 
    + csvString.map(e => e.join(",")).join("\n");

console.log(csvContent);