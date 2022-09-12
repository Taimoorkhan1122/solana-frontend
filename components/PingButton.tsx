import { FC, useState } from "react";
import styles from "../styles/PingButton.module.css";
import * as web3 from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const PROGRAM_ID = new web3.PublicKey("ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa");
const PROGRAM_DATA_PUBLIC_KEY = new web3.PublicKey("Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod");

export const PingButton: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const onClick = () => {
        console.log("Ping!");
        if (!connection || !publicKey) {
            alert("Please connect  wallet first");
            return;
        }

        const transaction = new web3.Transaction();
        const instructions = new web3.TransactionInstruction({
            keys: [
                {
                    pubkey: PROGRAM_DATA_PUBLIC_KEY,
                    isSigner: false,
                    isWritable: true,
                },
            ],
            programId: PROGRAM_ID,
        });
        transaction.add(instructions);
        sendTransaction(transaction, connection).then((sign) =>
            console.log(`https://explorer.solana.com/tx/${sign}?cluster=devnet`),
        );
    };

    return (
        <div className={styles.buttonContainer} onClick={onClick}>
            <button className={styles.button}>Ping!</button>
        </div>
    );
};
