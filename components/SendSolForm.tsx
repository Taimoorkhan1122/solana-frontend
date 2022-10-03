import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useEffect, useState } from "react";
import * as Web3 from "@solana/web3.js";

import { transferSolToAccountTx } from "./transferSol";
import styles from "../styles/Home.module.css";

export const SendSolForm: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [balance, setBalance] = useState(0);
    const [transactionHash, setTransactionHash] = useState(null);
    const [transactionList, setTransactionList] = useState<Web3.VersionedTransactionResponse[]>();

    const sendSol = async (event) => {
        event.preventDefault();
        const amount = event.target.amount.value;
        const recipient = new Web3.PublicKey(event.target.recipient.value);
        console.log("Recipeint ==>", recipient, publicKey);

        try {
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

            const tx = await transferSolToAccountTx(publicKey, recipient, amount, connection);
            console.log(`Sending ${amount} SOL to ${recipient}`);

            const signature = await sendTransaction(tx, connection);
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });

            //sign and confirm transaction
            console.log("📜 Verifying transaction...");
            //view transaction signature on etherscan
            const currentBalance = await connection.getBalance(publicKey);
            setBalance(currentBalance / Web3.LAMPORTS_PER_SOL);
            const newTransaction = await connection.getTransaction(signature, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 1,
            });

            setTransactionList((prevList: Web3.VersionedTransactionResponse[]) => [newTransaction, ...prevList]);
        } catch (error) {
            console.log(`Error in sending transaction`, error);
        }
    };

    useEffect(() => {
        if (publicKey) {
            const getBalance = async () => {
                let b = await connection.getBalance(publicKey);
                setBalance(b / Web3.LAMPORTS_PER_SOL);

                const confirmedSignatures = await connection.getConfirmedSignaturesForAddress2(publicKey);
                const confirmedTransactions: Web3.VersionedTransactionResponse[] = [];
                for (let sign of confirmedSignatures.slice(0, 10)) {
                    const confirmed = await connection.getTransaction(sign.signature, {
                        commitment: "finalized",
                        maxSupportedTransactionVersion: 1,
                    });
                    confirmedTransactions.push(confirmed);
                }
                setTransactionList(confirmedTransactions);
            };
            getBalance();
        }
    }, [connection, publicKey]);

    return (
        <div>
            <form onSubmit={sendSol} className={styles.form}>
                <p>
                    <strong>Current Balance</strong> {balance}{" "}
                </p>
                <label htmlFor="amount">Amount (in SOL) to send:</label>
                <input id="amount" type="text" className={styles.formField} placeholder="e.g. 0.1" required />
                <br />
                <label htmlFor="recipient">Send SOL to:</label>
                <input
                    id="recipient"
                    type="text"
                    className={styles.formField}
                    placeholder="e.g. 4Zw1fXuYuJhWhu9KLEYMhiPEiqcpKd6akw3WRZCv84HA"
                    required
                />
                <button type="submit" className={styles.formButton}>
                    Send
                </button>
            </form>
            <h3>Transaction List</h3>
            <div className={styles.transactionList}>
                {transactionList &&
                    transactionList.map((tx, index) => (
                        <div key={index + tx.slot}>
                            <span>{index + 1}. </span>
                            🎉 view this transaction on the Solana Explorer at{" "}
                            <a
                                href={`https://explorer.solana.com/tx/${tx.transaction.signatures[0]}?cluster=devnet`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Solana Explorer
                            </a>
                        </div>
                    ))}
            </div>
        </div>
    );
};

