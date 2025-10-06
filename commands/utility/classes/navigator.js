class ArrayNavigator {
    constructor() { // специальный метод класса, который автоматически вызывается при создании нового объекта (экземпляра) этого класса.
        this.array = []
        this.index = 0
    }

    push(...elements) {
        this.array.push(...elements) // elements становится массивом всех переданных аргументов // Эквивалентно: this.arr.push(element1, element2, element3, ...)
    }

    next() { // переключает на следующий элемент массива
        if(this.index < this.array.length - 1) { // если индекс меньше, чем длина массива - 1
            this.index++ 
        }
        return this.current()
    }

    prev() { //переключает на предыдущий элемент массива
        if(this.index > 0) { // если индекс больше 0
            this.index--
        } 
        return this.current()
    }

    current() { // возвращает элемент массива исходя из заданных условий
        return this.array[this.index]
    }

    jumpTo(index) { // перепрыгивает на указанный индекс
        if(this.index > 0 && this.index < this.array.length - 1) { 
            this.index = index
        }
        return this.current()
    }

    indexOf(...elements) {
        this.array.indexOf(...elements)
    }

    get length() { // Это геттер (getter) - специальный метод в JavaScript, который позволяет обращаться к свойству как к обычному полю, но при этом выполняется функция.
        return this.array.length
    }
    
}

module.exports = {
    ArrayNavigator
}