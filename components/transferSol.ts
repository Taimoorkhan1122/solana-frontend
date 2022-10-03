import * as web3 from "@solana/web3.js";

// create transfer function
export async function transferSolToAccountTx(
    payer: web3.PublicKey,
    receiver: web3.PublicKey,
    amount: number,
    conn: web3.Connection,
): Promise<web3.Transaction> {
    //some checks before transaction
    const payerBalance = await conn.getBalance(payer);
    if (payerBalance / web3.LAMPORTS_PER_SOL < amount) {
        const msg = `not enough account balance...\nCurrent Balance: ${payerBalance}\nRequested Amount: ${amount}`;
        throw new Error(msg);
    }
    if (amount <= 0) {
        const msg = `amount should be greater than 0\nRequested Amount: ${amount}`;
        throw new Error(msg);
    }

    const tx = new web3.Transaction();
    tx.add(
        web3.SystemProgram.transfer({
            fromPubkey: payer,
            toPubkey: receiver,
            lamports: amount * web3.LAMPORTS_PER_SOL,
        }),
    );
    return tx;
}

