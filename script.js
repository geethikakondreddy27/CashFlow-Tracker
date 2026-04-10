//Data storage
let salary = 0;
let expenses = []; //All expenses as a list
let chart;
let alertshown = false;
let currentCurrency = "INR";
let exchangeRate = 1;

//1.setting salary
function SetSalary() {
    const inputField = document.getElementById("salaryInput");
    const val = parseFloat(inputField.value);
    if (isNaN(val) || Math.sign(val) <= 0) {
        alert("Salary must be a positive number greater than 0.");
        return false; 
    }

    salary = val;
    saveToLocalStorage();
    inputField.value = ""; // Only clear if valid
    return true;
}

//2.Adding expenses
function AddExpense(name, amount) {
  if (!name) {
    console.log("Expenses name can not be empty");
    return;
  }
  if (amount <= 0) {
    console.log("Amount must be greater than zero.");
    return;
  }

  const expense = {
    id: Date.now(),
    name: name,
    amount: Number(amount),
  };

  expenses.push(expense);
  console.log("Expense added:", expense);
  console.log("All expense:", expenses);

  saveToLocalStorage();
}

//3.Delete expense
function deleteExpense(id) {
  expenses = expenses.filter((exp) => exp.id !== id);
  console.log("Expense deleted.Updated list:", expenses);
  saveToLocalStorage();
}

//4.calculate total expenses

function getTotalExpenses() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  console.log("Total expenses:", total);
  return total;
}

//5.calculating remaing balance
function getBalance() {
  const balance = salary - getTotalExpenses();
  console.log("Remaining balance:", balance);
  return balance;
}

function handleSetSalary() {
  //const input = document.getElementById("salaryInput").value = "";
  if(SetSalary()){
     updateSummary();
  renderChart();
  renderBarChart();
  }
}

function handleAddExpense() {
  const name = document.getElementById("expensename").value;
  const amount = document.getElementById("expenseamount").value;
  if (!name || amount <= 0) {
    alert("Enter valid expense details");
    return;
  }
  AddExpense(name, amount);
  renderExpenses();
  updateSummary();
  renderChart();
  renderBarChart();
  document.getElementById("expensename").value = "";
  document.getElementById("expenseamount").value = "";
}

function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";
  expenses.forEach((exp) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.innerText = `${exp.name} - ${currentCurrency} ${convert(exp.amount)}`;
    const btn = document.createElement("button");
    btn.innerText = "Delete";
    btn.onclick = function () {
      deleteExpense(exp.id);
      renderExpenses();
      updateSummary();
      renderChart();
      renderBarChart();
    };

    li.appendChild(text);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function updateSummary() {
  const total = getTotalExpenses();
  const balance = getBalance();
  document.getElementById("salaryDisplay").innerText =
    `${currentCurrency} ${convert(salary)}`;
  document.getElementById("totalExpenses").innerText =
    `${currentCurrency} ${convert(total)}`;
  document.getElementById("balance").innerText =
    `${currentCurrency} ${convert(balance)}`;

  //budge alert
  if (salary > 0 && balance < salary * 0.1) {
    document.getElementById("balance").style.color = "red";

    if (!alertshown) {
      alert("Warning: Your balance is below 10% of your salary!");
      alertshown = true;
    }
  } else {
    document.getElementById("balance").style.color = "black";
    alertshown = false;
  }
}

//Saving to localstorage
function saveToLocalStorage() {
  const data = {
    salary: salary,
    expenses: expenses,
  };
  localStorage.setItem("cashflow", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem("cashflow");
  if (!data) return;
  const parsedData = JSON.parse(data);
  salary = parsedData.salary || 0;
  expenses = parsedData.expenses || [];
}
window.onload = function () {
  loadFromLocalStorage();
  document.getElementById("salaryDisplay").innerText =
    `${currentCurrency} ${convert(salary)}`;
  document.getElementById("salaryInput").value = salary;

  renderExpenses();
  updateSummary();
  renderChart();
  renderBarChart();
};

//charts
function renderChart() {
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  const canvas = document.getElementById("myChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  //destroy old chart before creating new one
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Expenses", "Remaining Balance"],
      datasets: [
        {
          data: [totalExpenses, balance],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
  console.log("Chart function called");
}
//render bar chart
function renderBarChart() {
  const canvas = document.getElementById("BarChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const totalExpenses = getTotalExpenses();
  const balance = getBalance();
  if (window.barChart) {
    window.barChart.destroy();
  }
  window.barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Salary", "Expenses", "Balance"],
      datasets: [
        {
          label: "Comparision",
          data: [salary, totalExpenses, balance],
          backgroundColor: ["#4CAF50", "#f44336", "#2196F3"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          enabled: true, 
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          cornerRadius: 8,
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
  console.log("Chart function called");
}



//download PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20; // Start a bit lower from the top
 //Header
  doc.setFontSize(22);
  doc.setTextColor(67, 97, 238); 
  doc.text("CASH FLOW REPORT", 105, y, { align: "center" });
  
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y); // Horizontal line
  
  // 2. Summary Section in pdf view
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Summary", 20, y);
  
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.text(`Initial Salary: ${currentCurrency} ${convert(salary)}`, 25, y);
  y += 8;
  doc.text(`Total Expenses: ${currentCurrency} ${convert(getTotalExpenses())}`, 25, y);
  y += 8;
  doc.text(`Final Balance: ${currentCurrency} ${convert(getBalance())}`, 25, y);

  // 3. Transactions Table
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.text("Recent Transactions", 20, y);
  
  y += 8;
  doc.setLineWidth(0.1);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  if (expenses.length === 0) {
    doc.text("No transactions recorded.", 25, y);
  } else {
    expenses.forEach((exp, index) => {
      // If we run out of page space, this pushes text to a new line
      if (y > 270) { 
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${exp.name}`, 25, y);
      doc.text(`${currentCurrency} ${convert(exp.amount)}`, 180, y, { align: "right" });
      y += 8;
    });
  }
  // 4. Footer line
  doc.line(20, 280, 190, 280);
  doc.setFontSize(10);
  doc.text("Generated by Cash Flow Tracker", 105, 285, { align: "center" });

  doc.save("CashFlow_Report.pdf");
}





//Currency exchange rate
const exchangeRates = {
  "INR": 1,
  "USD": 0.012,
  "EUR": 0.011
};
async function changeCurrency() {
  const selected = document.getElementById("currencySelect").value;
  currentCurrency = selected;

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR");
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    // Update our rates object with real-time data from the API
    exchangeRate = data.rates[selected];
    console.log(`Live rate updated: 1 INR = ${exchangeRate} ${selected}`);
    
  } catch (error) {
    // If CORS error occurs or API is down, use your hardcoded logic as a fallback
    console.error("CORS or API Error. Using manual fallback rates.", error);
    
    if (selected === "INR") exchangeRate = 1;
    else if (selected === "USD") exchangeRate = 0.012;
    else if (selected === "EUR") exchangeRate = 0.011;
  }

  updateUIAfterCurrencyChange();
}



function convert(amount) {
  return (amount * exchangeRate).toFixed(2);
}

function updateUIAfterCurrencyChange() {
  document.getElementById("salaryDisplay").innerText =
    `${currentCurrency} ${convert(salary)}`;
  renderExpenses();
  updateSummary();
  renderChart();
  renderBarChart();
}
