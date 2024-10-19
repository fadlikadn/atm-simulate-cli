# ATM CLI

## Overview

The ATM CLI is a simple command-line interface that simulates the interaction between a customer and an ATM. Users can log in, deposit, withdraw, transfer funds, and view balances. The ATM also handles cases where a user owes money to another user and allows debt management.

## Features

- **Login**: Users can log in with their name. If the user doesn't exist, they are created with a starting balance of $0.
- **Deposit**: Users can deposit money into their account, which will also handle any existing debts they owe to other users.
- **Withdraw**: Users can withdraw money from their balance if sufficient funds are available.
- **Transfer**: Users can transfer money to another user. If the user doesn't have enough balance to cover the full transfer, the system will create an IOU (debt) to the target user.
- **Debt Management**: The ATM tracks debts between users (who owes whom and how much) and manages the repayment of debts when deposits are made.
- **Logout**: Users can log out, and their session will be ended.
- **Quit**: Terminates the program.

## Commands

### `login [name]`
Logs in as the specified customer. If the customer does not exist, they will be created with an initial balance of $0.

- Example:
  ```bash
  $ login Alice
  Hello, Alice!
  Your balance is $0
  ```

### `deposit [amount]`
Deposits the specified amount into the logged-in customer's account. If the customer owes money to another user, the deposit will automatically transfer funds to cover the debt.

- Example:
  ```bash
  $ deposit 100
  Your balance is $100
  ```
- If there is debt to another user:
  ```bash
  $ deposit 50
  Transferred $30 to Bob
  Your balance is $20
  Owed $70 to Bob
  ```

### `withdraw [amount]`
Withdraws the specified amount from the logged-in customer's balance, if there are sufficient funds.

- Example:
  ```bash
  $ withdraw 30
  Your balance is $70
  ```
- Example with insufficient funds:
  ```bash
  $ withdraw 100
  Insufficient funds, your balance is 70
  ```

### `transfer [target] [amount]`
Transfers the specified amount from the logged-in customer's balance to the target customer. If the balance is insufficient, the remaining amount will be recorded as a debt to the target customer.

- Example:
  ```bash
  $ transfer Bob 50
  Transferred $50 to Bob
  Your balance is $20
  ```

- Example with insufficient funds:
  ```bash
  $ transfer Alice 100
  Transferred $50 to Alice
  Owed $50 to Alice
  ```

### `logout`
Logs out the current customer, ending their session.

- Example:
  ```bash
  $ logout
  Goodbye, Alice!
  ```

### `quit`
Quits the program and terminates the session.

- Example:
  ```bash
  $ quit
  Goodbye!
  ```

## Program Flow

1. **Login Process**:
   - Customers log in using the `login [name]` command.
   - If the customer exists, their balance and debts (owed to or owed from other users) are displayed.
   - If the customer is new, they are created with a balance of $0, and a welcome message is shown.

2. **Deposits**:
   - Use the `deposit [amount]` command to add funds.
   - The system checks for any outstanding debts and automatically repays them using part of the deposit.
   - The remaining deposit (after debt payments) is added to the customer's balance.

3. **Withdrawals**:
   - Use the `withdraw [amount]` command to subtract funds from the customer's balance.
   - The withdrawal only proceeds if there are enough funds in the account.

4. **Transfers**:
   - Use the `transfer [target] [amount]` command to transfer funds to another customer.
   - If there are insufficient funds, the available balance is transferred, and the remaining amount is recorded as a debt (owedTo).

5. **Debt Management**:
   - Debt is tracked using two mappings: `owedTo` (who the user owes money to) and `owedFrom` (who owes the user money).
   - When a deposit is made, the system first applies the funds to repay any debts.

## Code Structure

### Customer Interface

- Represents a customer with a name, balance, and debt mappings.

```typescript
interface Customer {
  name: string;
  balance: number;
  owedTo: Map<string, number>;
  owedFrom: Map<string, number>;
}
```

## ATM Class

- Manages customer data, login, deposit, withdrawal, transfers, and debt tracking.
- Uses `Map<string, Customer>` to store customer information.
- Handles the logic for adjusting balances, transferring funds, and tracking debts.

### Key Methods
- `login(name: string)`
- `deposit(amount: number)`
- `withdraw(amount: number)`
- `transfer(targetName: string, amount: number)`
- `logout()`
- `quit()`

### Command Input

- The command-line interface is handled using Node.js's readline module.
- Each user command is parsed and passed to the relevant ATM class methods.

### Notes

- **Error Handling**: If users attempt actions (such as `withdraw`, `deposit`, or `transfer`) without logging in, appropriate error messages are displayed.
- **Debt Recording**: When transferring an amount larger than a user's balance, the system automatically tracks the debt and displays it when logging in.
- **Persistent State**: This current version does not persist customer data between runs. Every time the program starts, it starts fresh.

### Example

```bash
> login John
Welcome John!
Balance: 500

> deposit 200
Deposit successful. New balance: 700

> withdraw 300
Withdrawal successful. New balance: 400

> transfer Mary 500
Insufficient funds! Debt recorded: 100

> logout
Goodbye, John!
```

## Running Program

1. Install dependencies
  ```bash
      npm install
  ```
2. Run the program using `ts-node`
  ```bash
      npx ts-node src/index.ts
  ```
3. Run test
  ```bash
      npx jest
  ```

--------------------
### Note
- Archive to zip file: `git archive --format=zip HEAD > atm-cli.zip`