import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (accum, transaction) => {
        if (transaction.type === 'income') {
          accum.income += Number(transaction.value);
        } else {
          accum.outcome += Number(transaction.value);
        }
        return accum;
      },
      {
        income: 0,
        outcome: 0,
      },
    );
    return {
      ...balance,
      total: balance.income - balance.outcome,
    };
  }
}

export default TransactionsRepository;
