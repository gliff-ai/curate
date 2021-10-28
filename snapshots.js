module.exports = [{
  name: 'Curate Home',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',

  additionalSnapshots: [{
    suffix: 'large-thumbnail',
    execute() {
    document.querySelector('#large-thumbnail').click() 

    }
  }, 
  {
    suffix: 'medium-thumbnail',
    execute() {
    document.querySelector('#medium-thumbnail').click() 
    }
},
  {
    suffix: 'small-thumbnail',
    execute() {
    document.querySelector('#small-thumbnail').click() 
    }
  },]
}]