import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import transactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(transactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (balance.total < value) {
        throw new AppError('Insufficient balance');
      }
    }

    let categorySearch = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categorySearch) {
      categorySearch = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categorySearch);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categorySearch,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
