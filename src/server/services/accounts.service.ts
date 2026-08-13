import { ApiError } from "@/lib/api-error";
import type { CreateAccountInput, UpdateAccountInput } from "@/lib/validation/accounts";
import {
  createAccount,
  findAccountByIdForUser,
  findAccountsByUser,
  updateAccountForUser,
} from "@/server/repositories/accounts.repository";
import type { AccountRow } from "@/types/db";
import { getAccountBalance, getAccountBalances, getTotalBalance } from "./balances.service";
import { Money } from "./money";

export type AccountWithBalance = {
  id: number;
  name: string;
  accountType: AccountRow["account_type"];
  openingBalance: string;
  currentBalance: string;
  isActive: boolean;
};

function toAccountDto(account: AccountRow, balance: Money): AccountWithBalance {
  return {
    id: account.id,
    name: account.name,
    accountType: account.account_type,
    openingBalance: account.opening_balance,
    currentBalance: balance.toDecimalString(),
    isActive: account.is_active,
  };
}

export async function listAccountsForUser(
  userId: number,
  options?: { activeOnly?: boolean },
): Promise<{ accounts: AccountWithBalance[]; totalBalance: string }> {
  const accounts = await findAccountsByUser(userId, options);
  const balances = await getAccountBalances(userId, accounts);

  return {
    accounts: accounts.map((account) => toAccountDto(account, balances.get(account.id) ?? Money.zero())),
    totalBalance: getTotalBalance(accounts, balances).toDecimalString(),
  };
}

export async function getAccountForUser(
  userId: number,
  accountId: number,
): Promise<AccountWithBalance> {
  const account = await findAccountByIdForUser(accountId, userId);
  if (!account) {
    throw ApiError.notFound("Account not found");
  }
  const balance = await getAccountBalance(userId, account);
  return toAccountDto(account, balance);
}

export async function createAccountForUser(
  userId: number,
  input: CreateAccountInput,
): Promise<AccountWithBalance> {
  const account = await createAccount({
    user_id: userId,
    name: input.name,
    account_type: input.accountType,
    opening_balance: input.openingBalance,
  });
  // A freshly-created account has no transactions yet — balance == opening balance.
  return toAccountDto(account, Money.fromDecimalString(account.opening_balance));
}

export async function updateAccountForCurrentUser(
  userId: number,
  accountId: number,
  input: UpdateAccountInput,
): Promise<AccountWithBalance> {
  const existing = await findAccountByIdForUser(accountId, userId);
  if (!existing) {
    throw ApiError.notFound("Account not found");
  }

  const updated = await updateAccountForUser(accountId, userId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.accountType !== undefined ? { account_type: input.accountType } : {}),
    ...(input.openingBalance !== undefined ? { opening_balance: input.openingBalance } : {}),
    ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  });

  if (!updated) {
    throw ApiError.notFound("Account not found");
  }
  const balance = await getAccountBalance(userId, updated);
  return toAccountDto(updated, balance);
}
