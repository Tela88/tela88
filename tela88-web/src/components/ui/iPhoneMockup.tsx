import Image from "next/image";
import styles from "./iPhoneMockup.module.css";

interface IPhoneMockupProps {
  className?: string;
}

export default function IPhoneMockup({ className = "" }: IPhoneMockupProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.mockupShell}>
        <Image
          src="/mockups/iphone-hand-preview.png"
          alt="Hand holding iPhone mockup"
          width={512}
          height={901}
          priority
          className={styles.mockupImage}
        />
      </div>
    </div>
  );
}
