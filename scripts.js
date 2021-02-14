const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close(){
        // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const transactions = [
    {
        id: 1,
        description: 'Luz',
        amount: -50.3,
        date: '23/01/2021'
    },
    {
        id: 2,
        description: 'Internet',
        amount: 60.4,
        date: '23/01/2021'
    },
    /*{
        id: 3,
        description: 'Website',
        amount: 5000.22,
        date: '23/01/2021'
    },
    {
        id: 4,
        description: 'Condomínio',
        amount: -480.30,
        date: '23/01/2021'
    },*/
];

const storageKey = "dev.finances:transactions";
const Storage = {
    get() {
        console.log(localStorage);
        return JSON.parse(localStorage.getItem(storageKey)) || [];
    },
    set(transactions) {
        localStorage.setItem(storageKey, JSON.stringify(transactions));
    }
}

const Transaction = {
    //all: transactions,
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
        
    },    
    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },
    removeById(id) {
        let idx = Transaction.all.findIndex(transaction => {
            return transaction.id == id;
        });
        if(idx > 0) {
            Transaction.remove(idx);
        }    
    },
    incomes() {
        //somar as entradas
        let income = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income +=Number(transaction.amount);
            }
        });

        return income;
    },
    expenses() {
        //somar as saídas
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += Number(transaction.amount);
            }
        });

        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {

        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        const cssIncomeOrExpense = transaction.amount > 0 ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount);
        const html = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class="${cssIncomeOrExpense}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        </tr>
        `;

        return html;
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = 
            Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = 
            Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = 
            Utils.formatCurrency(Transaction.total());
    },
    clearTransactions() {
        DOM.transactionContainer.innerHTML = '';
    }
}

const Utils = {
    formatCurrency(value) {
        //const signal = Number(value) < 0 ? '-' : '';
        //value = String(value).replace(/\D/g, ""); //remvove caracteres não numéricos
        //value = String(value).replace(/,/g, ".");

        //value = Number(value) / 100;
        value = Number(value).toFixed(2);
        value = value.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL" 
        });
        value = value.replace(".", ",");

        return value;
    },
    formatAmount(value) {
        //value = Number(value) * 100;
        //value = String(value).replace(/,/g, ".");
        value = Number(value).toFixed(2);
        console.log(value);
        return value;
    },
    formatDate(dt) {
        const ds = dt.split("-")
        return `${ds[2]}/${ds[1]}/${ds[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    getNextIdx() {
        let maxId = 0;
        Transaction.all.forEach(transaction => {
            if(maxId < transaction.id) {
                maxId = transaction.id;
            }
        })
        return ++maxId;
    },

    formatValues() {
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        //alert(Form.getNextIdx());
        console.log(amount)
        return {id: Form.getNextIdx(), description, amount, date}
    },
    validateFields() {
        const {description, amount, date} = Form.getValues();
        if(description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "")  {
                throw new Error("Por favor preencha todos os campos");
        }
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    saveTransaction(transaction) {
        Transaction.add(transaction);
    },
    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            const transaction = Form.formatValues();

            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.close();
        } catch(error) {
            alert(error.message);
        }
        

    }
}



const App = {
    init() {
        //Converter array para o html
        /*Transaction.all.forEach( (transaction, index) => {
            DOM.addTransaction(transaction, index);
        });*/

        //passa a referência para a fução de callback
        Transaction.all.forEach(DOM.addTransaction); 

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions(); 
        App.init();
    }
}


App.init();

/*
Transaction.add({
    id: 55,
    description: 'Alo',
    amount: 200,
    date: '30/01/2021'
});

Transaction.removeById(55);
*/
/*Transaction.remove(4);
Transaction.remove(3);
Transaction.remove(2);
Transaction.remove(1);
Transaction.remove(0);*/