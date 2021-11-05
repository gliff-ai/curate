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
   {
    suffix: 'select-multiple-images',
    execute() {
    document.querySelector('#select-multiple-images').click() 
    }
  },
   {
    suffix: 'image',
    execute() {
    document.querySelector('#images').click() 
    }
  },
   {
    suffix: 'sort',
    execute() {
    document.querySelector('#sort').click() 
    }
  },
   {
    suffix: 'auto-assign-images',
    execute() {
    document.querySelector('#auto-assign-images').click() 
    }
  },
     {
    suffix: 'update-assignees',
    execute() {
    document.querySelector('#update-assignees').click() 
    }
  },
  {
    suffix: 'add-label',
    execute() {
    document.querySelector('#add-label').click() 
    }
  },
    {
    suffix: 'combobox-metadata-key',
    execute() {
    document.querySelector('#combobox-metadata-key').click() 
    }
  },
   {
    suffix: 'assign',
    execute() {
    document.querySelector('#assign').click() 
    }
  },
]
}]