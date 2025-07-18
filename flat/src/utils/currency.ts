export const formatCurrency = (value: number): string => {
  if (value === 0) return '0원';
  
  const eok = Math.floor(value / 100000000);
  const man = Math.floor((value % 100000000) / 10000);
  const remainder = value % 10000;
  
  let result = '';
  if (eok > 0) result += `${eok}억`;
  if (man > 0) {
    if (result) result += ' ';
    if (man >= 1000) {
      const cheonman = Math.floor(man / 1000);
      const baekman = Math.floor((man % 1000) / 100);
      const restMan = man % 100;
      result += `${cheonman}천`;
      if (baekman > 0) result += `${baekman}백`;
      if (restMan > 0) result += `${restMan}`;
      result += '만';
    } else if (man >= 100) {
      const baekman = Math.floor(man / 100);
      const restMan = man % 100;
      result += `${baekman}백`;
      if (restMan > 0) result += `${restMan}`;
      result += '만';
    } else {
      result += `${man}만`;
    }
  }
  if (remainder > 0 && eok === 0 && man === 0) {
    result += `${remainder}`;
  }
  return result + '원';
};

export const parseCurrency = (str: string): number => {
  str = str.replace(/[^0-9억천백만]/g, '');
  let total = 0;
  
  const eokMatch = str.match(/(\d+)억/);
  if (eokMatch) total += parseInt(eokMatch[1]) * 100000000;
  
  const cheonmanMatch = str.match(/(\d+)천(?=만|$)/);
  if (cheonmanMatch && str.includes('만')) total += parseInt(cheonmanMatch[1]) * 10000000;
  
  const baekmanMatch = str.match(/(\d+)백(?=만|$)/);
  if (baekmanMatch && str.includes('만')) total += parseInt(baekmanMatch[1]) * 1000000;
  
  const manMatch = str.match(/(\d+)만/);
  if (manMatch && !str.includes('천') && !str.includes('백')) {
    total += parseInt(manMatch[1]) * 10000;
  }
  
  const remainderMatch = str.match(/(\d+)$/);
  if (remainderMatch && !str.includes('만') && !str.includes('억')) {
    total += parseInt(remainderMatch[1]);
  }
  
  return total;
};