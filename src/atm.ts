#!/usr/bin/env ts-node
import * as readline from 'readline'

interface Customer {
  name: string
  balance: number
  owedTo: Map<string, number>
  owedFrom: Map<string, number>
}

export class ATM {
  private customer: Map<string, Customer> = new Map()
  private currentCustomer?: Customer

  login(name: string) {
    if (this.customer.has(name)) {
      this.currentCustomer = this.customer.get(name)
      console.log(`Hello, ${name}!`)
      console.log(`Your balance is $${this.currentCustomer?.balance}`)
      if (this.currentCustomer && this.currentCustomer.owedTo.size > 0) {
        this.currentCustomer.owedTo.forEach((value, key) => {
          console.log(`Owed $${value} to ${key}`)
        })
      }
      if (this.currentCustomer && this.currentCustomer.owedFrom.size > 0) {
        this.currentCustomer.owedFrom.forEach((value, key) => {
          console.log(`Owed $${value} from ${key}`)
        })
      }
    } else {
      this.currentCustomer = { name, balance: 0, owedTo: new Map(), owedFrom: new Map() }
      this.customer.set(name, this.currentCustomer)
      console.log(`Hello, ${name}!`)
      console.log('You are a new customer. Your balance is $0')
    }
  }

  deposit(amount: number) {
    if (!this.currentCustomer) {
      console.log('You are not logged in')
      return
    }
    let remainingAmount = amount
    if (this.currentCustomer.owedTo.size > 0 && this.currentCustomer.balance === 0) {
      this.currentCustomer.owedTo.forEach((value, key) => {
        if (value > 0) {
          if (remainingAmount >= value) {
            this.currentCustomer?.owedTo.set(key, 0)
            console.log(`Transfered $${value} to ${key}`)
            const targetCustomer = this.customer.get(key)
            if (targetCustomer && this.currentCustomer) {
              targetCustomer.owedFrom.set(this.currentCustomer.name, 0)
              targetCustomer.balance += value
            }
            remainingAmount -= value
          } else {
            this.currentCustomer?.owedTo.set(key, value - remainingAmount)
            console.log(`Transfered $${remainingAmount} to ${key}`)
            const targetCustomer = this.customer.get(key)
            if (targetCustomer && this.currentCustomer) {
              targetCustomer.owedFrom.set(this.currentCustomer.name, value - remainingAmount)
              targetCustomer.balance += remainingAmount
            }
            if (this.currentCustomer) {
              console.log(`Owed $${this.currentCustomer.owedTo.get(key)} to ${key}`)
            }
            remainingAmount = 0
          }
        }
      })
    }
    this.currentCustomer.balance += remainingAmount
    console.log(`Your balance is $${this.currentCustomer.balance}`)
  }

  withdraw(amount: number) {
    if (!this.currentCustomer) {
      console.log('You are not logged in')
      return
    }
    if (this.currentCustomer.balance < amount) {
      console.log(`Insufficient funds, your balance is ${this.currentCustomer.balance}`)
      return
    }
    this.currentCustomer.balance -= amount
    console.log(`Your balance is $${this.currentCustomer.balance}`)
  }

  transfer(targetName: string, amount: number) {
    if (!this.currentCustomer) {
      console.log('You are not logged in')
      return
    }
    let remainingAmount = amount

    const targetCustomer = this.customer.get(targetName)
    if (!targetCustomer) {
      console.log('Target customer does not exist')
      return
    }

    if (this.currentCustomer.balance < remainingAmount) {
      const transferRemaining = remainingAmount - this.currentCustomer.balance
      targetCustomer.balance += this.currentCustomer.balance
      this.currentCustomer.balance = 0
      const debt = (this.currentCustomer.owedTo.get(targetName) || 0) + transferRemaining
      this.currentCustomer.owedTo.set(targetName, debt)
      if (this.currentCustomer.owedTo.has(targetName)) {
        targetCustomer.owedFrom.set(this.currentCustomer.name, debt)
      } else {
        targetCustomer.owedFrom.set(this.currentCustomer.name, debt)
      }
    } else {
      if (this.currentCustomer.owedFrom.has(targetName)) {
        const debt = this.currentCustomer.owedFrom.get(targetName) || 0
        if (remainingAmount > debt) {
          this.currentCustomer.owedFrom.set(targetName, 0)
          this.customer.get(targetName)?.owedTo.set(this.currentCustomer.name, 0)
          remainingAmount -= debt
        } else {
          this.currentCustomer.owedFrom.set(targetName, debt - remainingAmount)
          this.customer.get(targetName)?.owedTo.set(this.currentCustomer.name, debt - remainingAmount)
          remainingAmount = 0
        }
      }

      targetCustomer.balance += remainingAmount
      this.currentCustomer.balance -= remainingAmount
    }

    console.log(`Transfered $${amount} to ${targetName}`)
    console.log(`Your balance is $${this.currentCustomer.balance}`)
    if (this.currentCustomer.owedTo.has(targetName)) {
      console.log(`Owed $${this.currentCustomer.owedTo.get(targetName)} tom ${targetName}`)
    }
  }

  logout() {
    if (!this.currentCustomer) {
      console.log('You are not logged in')
      return
    }
    console.log(`Goodbye, ${this.currentCustomer.name}!`)
    this.currentCustomer = undefined
  }

  quit() {
    console.log('Goodbye!')
    process.exit(0)
  }
}

const atm = new ATM()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function prompt() {
  rl.question('$ ', (input) => {
    const [command, ...args] = input.split(' ')
    switch (command) {
      case 'login':
        atm.login(args[0])
        break
      case 'quit':
        atm.quit()
        break
      case 'logout':
        atm.logout()
        break
      case 'deposit':
        atm.deposit(parseFloat(args[0]))
        break
      case 'withdraw':
        atm.withdraw(parseFloat(args[0]))
        break
      case 'transfer':
        atm.transfer(args[0], parseFloat(args[1]))
        break
      default:
        console.log('Unknown command')
    }
    prompt()
  })
}

prompt()