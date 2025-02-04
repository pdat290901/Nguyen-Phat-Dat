
// 1.Lặp lại quá nhiều lần trên dữ liệu:
// Vấn đề: Mã đang lặp lại qua mảng sortedBalances nhiều lần:
// Một lần để lọc và sắp xếp các số dư (useMemo).
// Một lần nữa để định dạng các số dư (map tạo formattedBalances).
// Một lần nữa để tạo các dòng trong JSX (map tạo rows).
// Tác động: Mỗi lần gọi .map() sẽ tạo ra một mảng mới, và vì điều này xảy ra nhiều lần, dẫn đến tính toán lại không cần thiết, làm giảm hiệu suất nếu số liệu lớn.
// Giải pháp: Bạn có thể kết hợp logic định dạng và tạo dòng vào một lần duy nhất để giảm bớt chi phí tính toán.

// 2.Dùng useMemo không hiệu quả:
// Vấn đề: Hook useMemo được sử dụng để memoize sortedBalances, nhưng nó phụ thuộc vào cả balances và prices. Điều này có thể dẫn đến việc tính toán lại không cần thiết:
// prices: Đối tượng prices có thể thay đổi không thường xuyên. Việc tính toán lại danh sách số dư đã sắp xếp mỗi khi prices thay đổi là không cần thiết, trừ khi giá trị của prices thực sự ảnh hưởng đến việc sắp xếp.
// Giải pháp: Tách biệt các phụ thuộc và memoize việc sắp xếp riêng biệt khỏi tính toán giá trị usdValue.

// 3.Sắp xếp lại dữ liệu không cần thiết:
// Vấn đề: Việc sắp xếp trong useMemo được thực hiện lại mỗi lần render, ngay cả khi balances không thay đổi. Sắp xếp là một thao tác tốn kém và việc tính toán lại mà không có thay đổi dữ liệu là không hiệu quả.
// Giải pháp: Memoize danh sách đã sắp xếp một cách độc lập, đảm bảo rằng việc sắp xếp chỉ xảy ra khi balances thay đổi.

// 4.Sử dụng index làm key trong danh sách:
// Vấn đề: Sử dụng index làm key cho các phần tử trong danh sách có thể gây vấn đề về hiệu suất, đặc biệt nếu danh sách có tính động (thêm, xóa hoặc thay đổi thứ tự các phần tử). React sẽ không thể nhận diện các phần tử đã thay đổi và có thể dẫn đến việc render lại không cần thiết.
// Giải pháp: Sử dụng một identifier duy nhất từ đối tượng balance, ví dụ như kết hợp currency và amount, để tạo ra key ổn định và duy nhất cho mỗi dòng.

// 5.Định dạng số với .toFixed():
// Vấn đề: Dùng .toFixed() để định dạng số có thể dẫn đến lỗi về độ chính xác (sai số làm tròn) và trả về một chuỗi, điều này có thể không lý tưởng cho các phép toán số học sau này.
// Giải pháp: Nên sử dụng Intl.NumberFormat hoặc một thư viện hỗ trợ định dạng số chính xác hơn, giúp đảm bảo định dạng và giữ lại kiểu số để sử dụng trong các phép toán.

// Sau đây là phiên bản đã được cải tiến lại ạ!
// Đây là code đã sửa nhưng chưa import đầy đủ ạ!

import React, { useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: string): number => {
    switch (blockchain) {
      case "Osmosis":
        return 100;
      case "Ethereum":
        return 50;
      case "Arbitrum":
        return 30;
      case "Zilliqa":
        return 20;
      case "Neo":
        return 20;
      default:
        return -99;
    }
  };

  // Memoize danh sách số dư đã sắp xếp (chỉ tính lại khi balances thay đổi)
  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance: WalletBalance) =>
          getPriority(balance.blockchain) > -99 && balance.amount > 0
      )
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // Sắp xếp theo thứ tự giảm dần
      });
  }, [balances]);

  // Memoize định dạng và tính toán usdValue (chỉ tính lại khi sortedBalances hoặc prices thay đổi)
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance) => {
      const formattedAmount = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance.amount); // Định dạng chính xác với 2 chữ số thập phân

      const usdValue = prices[balance.currency] * balance.amount;

      return {
        ...balance,
        formatted: formattedAmount,
        usdValue,
      };
    });
  }, [sortedBalances, prices]);

  // Tạo các dòng từ formattedBalances
  const rows = formattedBalances.map((balance: FormattedWalletBalance) => (
    <WalletRow
      className={classes.row}
      key={`${balance.currency}-${balance.amount}`} // Key là sự kết hợp giữa currency và amount để đảm bảo duy nhất
      amount={balance.amount}
      usdValue={balance.usdValue}
      formattedAmount={balance.formatted}
    />
  ));

  return <div {...rest}>{rows}</div>;
};
