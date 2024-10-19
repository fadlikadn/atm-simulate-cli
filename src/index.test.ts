import { ATM } from "./index";

describe('ATM', () => {
  let atm: ATM
  
  beforeEach(() => {
    atm = new ATM()
  })

  it('should transfer money to another customer properly', () => {
    atm.login('Alice')
    atm.deposit(100)
    expect(atm['currentCustomer']?.balance).toBe(100)
    atm.logout()
    expect(atm['currentCustomer']).toBeUndefined()

    atm.login('Bob')
    atm.deposit(80)
    expect(atm['currentCustomer']?.balance).toBe(80)

    atm.transfer('Alice', 50)
    expect(atm['currentCustomer']?.balance).toBe(30)

    atm.transfer('Alice', 100)
    expect(atm['currentCustomer']?.balance).toBe(0)
    expect(atm['currentCustomer']?.owedTo.get('Alice')).toBe(70)
    expect(atm['customer'].get('Alice')?.balance).toBe(180)
    expect(atm['customer'].get('Alice')?.owedFrom.get('Bob')).toBe(70)

    atm.deposit(30)
    expect(atm['currentCustomer']?.owedTo.get('Alice')).toBe(40)
    expect(atm['currentCustomer']?.balance).toBe(0)

    atm.logout()
    expect(atm['currentCustomer']).toBeUndefined()

    atm.login('Alice')
    expect(atm['currentCustomer']?.balance).toBe(210)
    expect(atm['currentCustomer']?.owedFrom.get('Bob')).toBe(40)

    atm.transfer('Bob', 30)
    expect(atm['currentCustomer']?.balance).toBe(210)
    expect(atm['currentCustomer']?.owedFrom.get('Bob')).toBe(10)
    expect(atm['customer'].get('Bob')?.balance).toBe(0)
    expect(atm['customer'].get('Bob')?.owedTo.get('Alice')).toBe(10)

    atm.logout()
    expect(atm['currentCustomer']).toBeUndefined()

    atm.login('Bob')
    expect(atm['currentCustomer']?.balance).toBe(0)
    expect(atm['currentCustomer']?.owedTo.get('Alice')).toBe(10)

    atm.deposit(100)
    expect(atm['currentCustomer']?.balance).toBe(90)
    expect(atm['currentCustomer']?.owedTo.get('Alice')).toBe(0)

    atm.logout()
    expect(atm['currentCustomer']).toBeUndefined()
    
  })

  it('should transfer money to multiple customer properly', () => {
    const customers = ['Alice', 'Bob', 'Charlie', 'David', 'Eve']
    customers.forEach((customer) => {
      atm.login(customer)
      atm.deposit(100)
      atm.logout()
    })
    
    atm.login('Alice')
    atm.transfer('Bob', 50)
    atm.transfer('Charlie', 30)
    atm.transfer('David', 20)
    atm.transfer('Eve', 10)

    expect(atm['currentCustomer']?.balance).toBe(0)
    expect(atm['currentCustomer']?.owedTo.get('Bob')).toBe(undefined)
    expect(atm['currentCustomer']?.owedTo.get('Charlie')).toBe(undefined)
    expect(atm['currentCustomer']?.owedTo.get('David')).toBe(undefined)
    expect(atm['currentCustomer']?.owedTo.get('Eve')).toBe(10)
    
    atm.deposit(40)
    expect(atm['currentCustomer']?.balance).toBe(30)
    expect(atm['currentCustomer']?.owedTo.get('Eve')).toBe(0)

    atm.logout()
    atm.login('Eve')
    expect(atm['currentCustomer']?.balance).toBe(110)
    expect(atm['currentCustomer']?.owedFrom.get('Alice')).toBe(0)

    expect(atm['customer'].get('Bob')?.balance).toBe(150)
    expect(atm['customer'].get('Charlie')?.balance).toBe(130)
    expect(atm['customer'].get('David')?.balance).toBe(120)
  })
})