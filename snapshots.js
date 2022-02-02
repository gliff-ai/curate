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
  name: 'Curate Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
    execute() {
    document.querySelector('#auto-assign-images').click() 
    }
},


{
  name: 'Curate Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
   execute() {
    document.querySelector('#update-assignees').click() 
    }
},
   

{
  name: 'Curate Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
     execute() {
    document.querySelector('#add-label').click() 
    }
},

{
  name: 'Curate Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
    execute() {
    document.querySelector('#combobox-metadata-key').click() 
    }
},

 
{
  name: 'Curate Image',
  url: 'http://localhost:3000',
  waitForSelector: '#large-thumbnail',
     execute() {
    document.querySelector('#assign').click() 
    }
}]
