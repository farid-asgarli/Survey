const firstNames = [
  'Barnebas',
  'Emmet',
  'Mela',
  'Paulina',
  'Saleem',
  'Jean',
  'Ilario',
  'Munmro',
  'Linn',
  'Frasier',
  'Myrvyn',
  'Kylila',
  'Cheryl',
  'Gui',
  'Caren',
  'Lia',
  'Gerhardt',
  'Standford',
  'Jan',
  'Sterling',
  'Virgilio',
  'Dido',
  'Had',
  'Agneta',
  'Harry',
  'Madeline',
  'Denney',
  'Moyra',
  'Amelie',
  'Georgena',
  'Sherm',
  'Craig',
  'Elene',
  'Eugenio',
  'Shelton',
  'Bertrando',
  'Boycie',
  'Rudyard',
  'Dante',
  'Cindie',
  'Idalina',
  'Imelda',
  'Marabel',
  'Myra',
  'Heather',
  'Midge',
  'Llewellyn',
  'Esmeralda',
  'Odelle',
  'Patton',
];
const lastNames = [
  'Thurley',
  'Glozman',
  'Colafate',
  'Wonham',
  'Dell',
  'Mycock',
  'Demonge',
  'Capaldo',
  'Zouch',
  'McGarvey',
  'Crumby',
  'Rykert',
  'Bosenworth',
  'Coopey',
  'Muckart',
  'McGeagh',
  'Sangwine',
  'Laidlow',
  'Feechum',
  'Eves',
  'Riquet',
  'Petford',
  'Traise',
  'Dessent',
  'Seefus',
  'New',
  'Southon',
  'Wehner',
  'Harries',
  'Brimelow',
  'Comello',
  'Pinard',
  'Langran',
  'Cuer',
  'Antoniades',
  'Pettiford',
  'Lamminam',
  'McQuirter',
  'Cartledge',
  'Fautly',
  'Northin',
  'Dmitrovic',
  'Foxon',
  'Luckcuck',
  'Radnage',
  'Vaughton',
  'Dwyr',
  'Brugger',
  'MacCaffrey',
  'Wigin',
];
const emails = [
  'bthurley0@cornell.edu',
  'eglozman1@privacy.gov',
  'mcolafate2@nih.gov',
  'pwonham3@wp.com',
  'sdellcasa4@abc.net',
  'jmycock5@loc.gov',
  'idemonge6@cnn.com',
  'mcapaldo7@google.com',
  'lzouch8@unc.edu',
  'fmcgarvey9@ow.ly',
  'mcrumbya@dmoz.org',
  'krykertb@forbes.com',
  'cbosenworthc@cnet.com',
  'gcoopeyd@mozilla.org',
  'cmuckarte@google.nl',
  'lmcgeaghf@sogou.com',
  'gsangwineg@mashable.com',
  'slaidlowh@vkontakte.ru',
  'jfeechumi@wordpress.com',
  'sevesj@walmart.com',
  'vriquetk@cbslocal.com',
  'dpetfordl@symantec.com',
  'htraisem@geocities.jp',
  'adessentn@mail.ru',
  'hseefuso@taobao.com',
  'mnewp@illinois.edu',
  'dsouthonq@washingtonpost.com',
  'mwehnerr@cafepress.com',
  'aharriess@mail.ru',
  'gbrimelowt@narod.ru',
  'scomellou@rakuten.co',
  'cpinardv@tmall.com',
  'elangranw@hatena.ne',
  'ecuerx@naver.com',
  'santoniadesy@baidu.com',
  'bpettifordz@mysql.com',
  'blamminam10@storify.com',
  'rmcquirter11@joomla.org',
  'dcartledge12@salon.com',
  'cfautly13@sbwire.com',
  'inorthin14@tmall.com',
  'idmitrovic15@nymag.com',
  'mfoxon16@bloglines.com',
  'mluckcuck17@eepurl.com',
  'hradnage18@myspace.com',
  'mvaughton19@plala.or',
  'ldwyr1a@example.com',
  'ebrugger1b@joomla.org',
  'omaccaffrey1c@1688.com',
  'pwigin1d@salon.com',
];
const adjectives = ['Mighty', 'Bright', 'Swift', 'Silent', 'Charming', 'Witty', 'Brave', 'Bold'];
const addresses = ['123 Main St, Baku', '456 Elm St, Ganja', '789 Oak St, Sumqayit'];
const nouns = ['Tiger', 'Eagle', 'Shark', 'Lion', 'Jaguar', 'Hawk', 'Bear', 'Fox'];
const genders = ['Male', 'Female'];
const currentYear = 2023;

export class _DataRandomizer {
  static generateDirectRestructurizationObject(): Omit<_DevEntities.Contract.RestructurizationDirectRequest, 'parentContractNumber'> {
    const { beginDate, endDate } = this.generateRandomDates();
    return {
      createdByAgent: 'Kapital Bank',
      creditInterestRate: 5,
      creditContractNumber: 'TKS-' + this.generateRandomDigitString(8),
      beginDate,
      endDate,
      annuity: Math.floor(Math.random() * 12) + 1,
      creditAmount: Math.floor(Math.random() * 10000) + 1000,
      createdByOperator: this.generateRandomUsername(),
      educationAmount: Math.floor(Math.random() * 10000) + 1000,
      restructurizationDate: beginDate,
    };
  }

  static generateDirectContractObject(): _DevEntities.Contract.ContractDirectRequest {
    const { beginDate, endDate } = this.generateRandomDates();
    return {
      address: addresses[Math.floor(Math.random() * addresses.length)],
      channelNumber: 1,
      birthDate: new Date(new Date().getFullYear() - 18 - Math.floor(Math.random() * 50), Math.floor(Math.random() * 12)),
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      gender: genders[Math.floor(Math.random() * genders.length)],
      educationAmount: Math.floor(Math.random() * 10000) + 1000,
      email: emails[Math.floor(Math.random() * emails.length)],
      patronymic: firstNames[Math.floor(Math.random() * firstNames.length)],
      phone: '+994-55-' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000),
      pinCode: Math.floor(Math.random() * 900000) + 100000 + 'A',
      annuity: Math.floor(Math.random() * 12) + 1,
      creditAmount: Math.floor(Math.random() * 10000) + 1000,
      createdByAgent: 'Kapital Bank',
      creditInterestRate: 5,
      creditContractNumber: 'TKS-' + this.generateRandomDigitString(8),
      beginDate,
      endDate,
      createdByOperator: this.generateRandomUsername(),
    };
  }

  static generateRandomDigitString(digitCount: number) {
    let result = '';
    for (let i = 0; i < digitCount; i++) result += Math.floor(Math.random() * 10); // Random digit between 0 and 9
    return result;
  }

  static getRandomDateFromYear(year: number) {
    const start = new Date(year, 0, 1); // Start from January 1st
    const end = new Date(year + 1, 0, 1); // Till December 31st of the same year
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  static generateRandomDates() {
    const beginDate = new Date();
    let endDate = this.getRandomDateFromYear(currentYear + 15);

    // Ensure endDate is after beginDate
    while (endDate <= beginDate) {
      endDate = this.getRandomDateFromYear(currentYear);
    }
    return {
      beginDate,
      endDate,
    };
  }

  static getRandomElement(arr: Array<string>) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static generateRandomUsername() {
    const adjective = this.getRandomElement(adjectives);
    const noun = this.getRandomElement(nouns);
    const number = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `${adjective}${noun}${number}`;
  }

  static generateRandomAmount() {
    return Math.floor(Math.random() * 10000) + 1000;
  }
}
