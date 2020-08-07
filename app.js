// BUDGET CONTROLLER
var budgetController = (function() {
    
    // Expense data structure
    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    }
    
    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
        this.percentage = Math.round((this.value / totalInc) * 100);
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // Income data structure
    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    }
    
    // calc total incomes and expenses
    function calcTotals() {
        var incomes = 0;
        var expenses = 0;
        var budget;
        // calculate total income
        data.allItems.inc.forEach(function(item) {
            incomes+= item.value;
        })
        //calculate total expenses
        data.allItems.exp.forEach(function(item) {
            expenses+= item.value;
        })
        //calculate total budget
        budget = incomes - expenses;
        // Put them in our data structure
        data.total.exp = expenses;
        data.total.inc = incomes;
        //Set Budget
        data.budget = budget;
    }
    // Inc and exp and total DS 
    var data = {
        allItems: {
            exp: [],
            inc:[]
        }, 
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return {

        // Make new Item 
        newItem: function(type, description, value) {
            var newItem, id;

            // ID is simply the last object of array [inc or exp].id + 1
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }
            
            // Check if type is inc or exp before make instance 
            if (type === "exp") {
                newItem = new Expense(id, description, value);
            } else if (type === "inc") {
                newItem = new Income(id, description, value);
            }
            // Push the new item to Data Structure
            data.allItems[type].push(newItem);
            return newItem;
        },
        calcBudget: function() {
            //calc and set total exp, inc, budget
            calcTotals(); 
            // set percentage
            if(data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },getBudget: function() {
            return {
                total_budget: data.budget,
                total_inc: data.total.inc,
                total_exp: data.total.exp,
                percentage: data.percentage
            }
        },
        deleteItem: function(type, id) {
            var ids, index;
            //get all ids
            ids = data.allItems[type].map(function(item) {
                return item.id;
            });
            // find the index of the recevied id
            index = ids.indexOf(id);
            // check if Map function work
            if (index !== -1) {
                // delete the item 
                data.allItems[type].splice(index, 1);
            }

            

        },
        calcPercentages: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.total.inc);
            })
        },
        getPercentages: function() {
            var allPercant = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            })
            return allPercant;
        },
        test: function() {
            console.log(data)
        }
    }

})();


// UI CONTROLLER
var uiController = (function() {
    var domStrings = {
        descriptionInput: ".add__description",
        typeInput: ".add__type",
        valueInput: ".add__value",
        addBtn: ".add__btn",
        incomeList: ".income__list",
        expenseList: ".expenses__list",
        budgetLable: ".budget__value",
        incomeLable: ".budget__income--value",
        expensesLable: ".budget__expenses--value",
        percentageLable: ".budget__expenses--percentage",
        container: ".container",
        expPercentLable: ".item__percentage",
        dateLable: ".budget__title--month"

    }
    return {
        getInput: function() {
            return {

                description : document.querySelector(domStrings.descriptionInput).value,
                type : document.querySelector(domStrings.typeInput).value, // value : inc or exp
                value : parseFloat(document.querySelector(domStrings.valueInput).value)

            };
            
        },
        clearFields: function() {
            var fields;
            var arrfields;
            fields = document.querySelectorAll(domStrings.descriptionInput + "," + domStrings.valueInput);
            arrfields = Array.prototype.slice.call(fields);
            arrfields.forEach(function(field) {
                field.value = "";
            }) 
            arrfields[0].focus();
        },

        getStrings: function() {
            return domStrings;
        },

        addItem: function(item, type) {

            var markup,
                element;

            if (type === "exp") {
                element = domStrings.expenseList;
                markup = `<div class="item clearfix" id="exp-${item.id}">
                <div class="item__description">${item.description}</div>
                <div class="right clearfix"><div class="item__value">${item.value}</div><div class="item__percentage">10%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div></div></div>`
            } else if (type === "inc") {
                element = domStrings.incomeList;
                markup = `<div class="item clearfix" id="inc-${item.id}">
                <div class="item__description">${item.description}</div>
                <div class="right clearfix"><div class="item__value">${item.value}</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div></div></div>`
            }
            document.querySelector(element).insertAdjacentHTML("beforeend", markup)
        },
        deleteItem: function(id) {
            var el;
            el = document.getElementById(id)
            el.parentNode.removeChild(el);
        },
        displayBudget: function(obj) {
            // display income and expenses and total budget
            document.querySelector(domStrings.budgetLable).innerHTML = obj.total_budget;
            document.querySelector(domStrings.incomeLable).innerHTML = obj.total_inc;
            document.querySelector(domStrings.expensesLable).innerHTML = obj.total_exp;
            
            // display percentage
            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLable).innerHTML = obj.percentage + "%"
            } else {
                document.querySelector(domStrings.percentageLable).innerHTML = "%"
            }
        },
        displayPercents: function(percArr) {
            var lables = document.querySelectorAll(domStrings.expPercentLable);
            lables.forEach(function(lable, i) {
                lable.innerHTML = percArr[i] + "%";
            });
        },
        displayDate: function() {
            var date, year, months, month;
            date = new Date();
            year = date.getFullYear();
            month = date.getMonth()

            months = ["January", "February", "March", "Abril", "May", "June", "July", "August", "Septembar", "October", "November", "December" ]
            
            document.querySelector(domStrings.dateLable).innerHTML = months[month] + " " + year;
        },
        change: function() {
            document.querySelectorAll(domStrings.typeInput + ',' + domStrings.descriptionInput + ',' + domStrings.valueInput)
            .forEach(function(input) {
                input.classList.toggle("red-focus")
            })
        }
    }
  

})();

// APP CONTROLLER
var controller = (function(budgetctrl, ui) {
    
    var setEvent = function() {
        var Dom = ui.getStrings();
        document.querySelector(Dom.addBtn).addEventListener("click", ctrlAddItem)
    
        document.addEventListener("keypress", function(event) {
            if (event.keyCode === 13) {
                
                ctrlAddItem();
            }
        })

        document.querySelector(Dom.container).addEventListener("click", deleteItem)
        document.querySelector(Dom.typeInput).addEventListener('change', ui.change)
    }

    var deleteItem = function(event) {
        var itemID, itemSplit, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // split id to type & id
            itemSplit = itemID.split("-");
            // get type and id
            type = itemSplit[0];
            id = parseInt(itemSplit[1]);
            // remove item from ds
            budgetctrl.deleteItem(type, id);
            // reomve item from UI
            ui.deleteItem(itemID);
            // re calc and update the budget
            updateBudget();
            // update percentages
            updatePercentages()
        }
    }

    var updatePercentages =  function() {
        // calc percentages from budget controller
        budgetctrl.calcPercentages();
        // get percentages ***
        var percentages = budgetctrl.getPercentages()
        // update user interface
        ui.displayPercents(percentages);
    }

    var updateBudget = function() {
        // calc the budget 
        budgetctrl.calcBudget();
        // get the budget
        var budget = budgetctrl.getBudget();
        //diplay the budget
        ui.displayBudget(budget)
    }

    var ctrlAddItem = function() {

        /* TO DO List */
    
        // Get input from user
        var input = ui.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // Add them to budget controller
            var newItem = budgetctrl.newItem(input.type, input.description, input.value);
            // Display item to the UI
            ui.addItem(newItem, input.type);
            // Clear input fields
            ui.clearFields();
            // Calculate and Display the Budget
            updateBudget();
            //update Percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
            //reset all lables
            ui.displayDate();
            ui.displayBudget({
                total_budget:0,
                total_exp: 0,
                total_inc:0,
                percentage: -1
            })
            setEvent();  
        } 
    }

})(budgetController, uiController);


// start app
controller.init();