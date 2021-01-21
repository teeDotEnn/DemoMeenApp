
const numPizzas = document.getElementById("numberOfPizzas");
const size = document.getElementsByName("size");
const tax = 0.13;
const toppings = document.getElementsByName("toppings");

function calculateSubTotal(size, numPizzas)
{
    switch (size){
        case 'small':
            return 7*numPizzas;
        case 'medium':
            return 12*numPizzas;
        case 'large':
            return 17*numPizzas;
        case 'extraLarge':
            return 25*numPizzas;
    }
}
function calculateTax(subtotal) {return subtotal*tax;}

function calculateGrandTotal(subtotal, tax)
{
    return subtotal+tax;
}
let subtotal = calculateSubTotal(size,numPizzas);
let tax = calculateTax(subtotal);
let grandTotal = calculateGrandTotal(subtotal, tax);

document.writeln(`Subtotal: $${subtotal}`);
document.writeln(`Tax: $${tax}`);
document.writeln(`Grand Total: $${tax}`);