export function decimalToBase64(num) {
    const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    
    let result = '';
    
    // Handle zero case explicitly
    if (num === 0) {
      return base64Chars[0];
    }
  
    // Convert the number to base 64
    while (num > 0) {
      result = base64Chars[num % 64] + result;
      num = Math.floor(num / 64);
    }
  
    return result;
  }
  
  export function base64ToDecimal(base64Number) {
    // Create a string of base64 digits
    const base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    let base10Number = 0;
    
    // Iterate over the base64 number, character by character
    for (let i = 0; i < base64Number.length; i++) {
        // Get the value of the current base64 digit
        let base64DigitValue = base64Digits.indexOf(base64Number[i]);
        
        // If the character is not a valid base64 digit, throw an error
        if (base64DigitValue === -1) {
            throw new Error(`Invalid character found: ${base64Number[i]}`);
        }
        
        // Shift the result by 6 bits (because base64 has 64 unique characters) and add the new value
        base10Number = base10Number * 64 + base64DigitValue;
    }
  
    return base10Number;
  }
  