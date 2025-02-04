
const inputAmount = document.getElementById("input-amount");
const outputAmount = document.getElementById("output-amount");
const swapButton = document.querySelector("button");
const errorMessage = document.getElementById("error-message");

// Giả lập tỉ giá hoán đổi 
const exchangeRate = 0.85;


inputAmount.addEventListener("input", () => {
  const value = inputAmount.value;

 
  if (isNaN(value) || Number(value) <= 0) {
    errorMessage.textContent = "Vui lòng nhập một số hợp lệ!";
    inputAmount.style.border = "1px solid red";
    outputAmount.value = ""; 
  } else {
    errorMessage.textContent = "";
    inputAmount.style.border = "1px solid #ddd";
    outputAmount.value = (Number(value) * exchangeRate).toFixed(2); 
  }
});

swapButton.addEventListener("click", () => {
  const value = inputAmount.value;

  
  if (isNaN(value) || Number(value) <= 0) {
    errorMessage.textContent = "Vui lòng nhập một số hợp lệ trước khi swap!";
    inputAmount.style.border = "1px solid red";
    return; 
  }

  
  swapButton.textContent = "Swapping...";
  swapButton.style.background = "#ff9800"; 

  setTimeout(() => {
    swapButton.textContent = "CONFIRM SWAP";
    swapButton.style.background = "#007bff"; 
    alert("Swap thành công! 🎉");
  }, 2000); 
});
