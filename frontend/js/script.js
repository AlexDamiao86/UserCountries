let globalUsers = [];
let globalCountries = [];
let globalUserCountries = [];
let globalUserCountriesFiltered = [];

async function start() {

  // Chamada normal
  // await fetchUsers();
  // await fetchCountries();

  // Promise sequencial
  // console.time('promise');
  // await promiseUsers();
  // await promiseCountries();
  // console.timeEnd('promise');

  // Promise paralela
  console.time('Carregamento');
  const p1 = promiseUsers();
  const p2 = promiseCountries();
  await Promise.all([p1, p2]);
  console.timeEnd('Carregamento');

  mergeUsersAndCountries();
  hideSpinner(); 
  configFilter();
  render();
}

function promiseUsers() {
  return new Promise(async (resolve, reject) => {
    const users = await fetchUsers();

    // setTimeout(() => {
    //   console.log('PromiseUsers resolvida');
      resolve(users);
    // }, 5000);
  });
}

function promiseCountries() {
  return new Promise(async (resolve, reject) => {
    const countries = await fetchCountries();

    // setTimeout(() => {
    //   console.log('PromiseCountries resolvida');
      resolve(countries);
    // }, 7000);
  });
}

async function fetchUsers() {
  const resource = await fetch('http://localhost:3002/users');
  const json = await resource.json();

  globalUsers = json.map(({ name, picture, login, nat }) => {
    return { 
      userId: login.uuid, 
      userCountry: nat, 
      userName: name.first, 
      userPicture: picture.large, 
    };
  });
  // console.log(globalUsers);
};

async function fetchCountries() {
  const resource = await fetch('http://localhost:3001/countries');
  const json = await resource.json();

  globalCountries = json.map(({ name, flag, alpha2Code }) => {
    return { 
      countryId: alpha2Code, 
      countryName: name, 
      countryFlag: flag, 
    };
  });
  // console.log(globalCountries);
}

function mergeUsersAndCountries () {
  globalUserCountries = [];

  globalUsers.forEach((user) => {
    const country = globalCountries.find(
      (country) => country.countryId === user.userCountry
    );
    globalUserCountries.push({...user, 
      countryName: country.countryName, 
      countryFlag: country.countryFlag,
    });
  });
  globalUserCountries.sort((a, b) => a.userName.localeCompare(b.userName));
  globalUserCountriesFiltered = [...globalUserCountries];
}

function hideSpinner() {
  const spinner = document.querySelector("#spinner");
  // A classe hide é do materialize
  spinner.classList.add('hide');
}

function render() {
  const divUsers = document.querySelector('#users');

  divUsers.innerHTML = `
    <div class='row'>
      ${globalUserCountriesFiltered.map(({countryName, countryFlag, userPicture, userName}) => {
        return `
          <div class='col s6 m4 l3'>
            <div class='flex-row bordered'>
              <img class='avatar' src='${userPicture}' alt='${userName}' />
              <div class='flex-column'>
                <span>${userName}</span>
                <img class='flag' src='${countryFlag}' alt='${countryName}' />
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function configFilter() {
  const buttonFilter = document.querySelector('#buttonFilter');
  buttonFilter.addEventListener('click', handleButtonClick);

  const inputFilter = document.querySelector('#inputFilter');
  inputFilter.addEventListener('keyup', handleFilterKeyUp);
}

function handleButtonClick() {
  const inputFilter = document.querySelector('#inputFilter');
  const filterValue = inputFilter.value.toLowerCase().trim();

  globalUserCountriesFiltered = globalUserCountries.filter((item) => {
    return item.userName.toLowerCase().includes(filterValue);
  });
  
  render();
}

function handleFilterKeyUp({ key }) {
  // const { key } = event; 
  if (key != 'Enter') {
    return;
  }
  handleButtonClick();
}

start();
