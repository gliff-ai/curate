module.exports = [{
  name: 'Curate Home',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',

  additionalSnapshots: [{
    suffix: '-large-thumbnail',
    execute() {
    document.querySelector('#large-thumbnail').click() 

    }
  },

  {
    suffix: '-medium-thumbnail',
    execute() {
    document.querySelector('#medium-thumbnail').click() 
    }
},
],},

{
  name: 'Curate Select',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
execute() {
    document.querySelector('#select-multiple-images').click() 
    },
},

{
  name: 'Curate Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
 execute() {
    document.querySelector('#images').click()
},},

{
  name: 'Curate Sort',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
 execute() {
    document.querySelector('#sort').click() 
    }
},

{
  name: 'Curate Assign Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
    execute() {
    document.querySelector('#auto-assign-images').click() 
    }
},

{
  name: 'Curate Add Label',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
     execute() {
    document.querySelector('#add-label').click() 
    }
},

{
  name: 'Curate Metadata Key',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
    execute() {
    document.querySelector('#combobox-metadata-key').click() 
    }
},
]
