<template>
    <div class="test">
        <h1>Welcome to Your Vue.js App</h1>
        <input v-model="newItem" >
        <button @click="addItemToList">Add</button>
        <!-- displays list --> 
        <ul>
            <li v-for="(item, index) in listItems" :key="index">{{ item }}</li>
        </ul>
    </div>
</template>
 
<script>
export default {
    name: 'test',
    data () {
        return {
            listItems: ['buy food', 'play games', 'sleep'],
            newItem: ''
        }
    },
    methods: {
        addItemToList () {
            this.listItems.push(this.newItem)
            this.newItem = ''
        }
    }
}
</script>