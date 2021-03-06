import { expect } from 'chai'
import 'mocha'
import { fillJsonObj, fromJsonObj, FromJsonObjOptions } from '../src/json'

describe('fromJsonObj', function() {
  it('should create an empty object', function() {
    let jsonObj = {}

    let obj = fromJsonObj(jsonObj)

    expect(obj).to.deep.equal({ })
  })

  it('should create the corresponding class', function() {
    let jsonObj = {
      '@class': 'TestClass1',
      a: {
        '@class': 'TestClass2'
      },
      b: [
        { '@class': 'TestClass1' }
      ]
    }

    let obj = fromJsonObj(jsonObj, { instantiator: instantiator })

    expect(obj).to.be.instanceOf(TestClass1)
    expect(obj.a).to.be.instanceOf(TestClass2)
    expect(obj.b).to.be.instanceOf(Array)
    expect(obj.b.length).to.equal(1)
    expect(obj.b[0]).to.be.instanceOf(TestClass1)
  })

  it('should create the a plain object if the instantiator does not have a corresponding class', function() {
    let jsonObj = {
      '@class': 'TestClass100',
      a: {
        '@class': 'TestClass100'
      },
      b: [
        { '@class': 'TestClass100' }
      ]
    }

    let obj = fromJsonObj(jsonObj, { instantiator: instantiator })

    expect(obj).to.be.instanceOf(Object)
    expect(obj.b).to.be.instanceOf(Array)
    expect(obj.b.length).to.equal(1)
    expect(obj.b[0]).to.be.instanceOf(Object)
  })

  it('should create the corresponding class of objects inside an array', function() {
    let array = [
      { '@class': 'TestClass1' },
      'a',
      1,
      { '@class': 'TestClass2' }
    ]

    let convertedArray = fromJsonObj(array, { instantiator: instantiator })

    expect(convertedArray.length).to.equal(4)
    expect(convertedArray[0]).to.be.instanceOf(TestClass1)
    expect(convertedArray[1]).to.equal('a')
    expect(convertedArray[2]).to.equal(1)
    expect(convertedArray[3]).to.be.instanceOf(TestClass2)

    let obj = {
      a: 'a',
      b: array,
      c: 1
    }

    let convertedObj = fromJsonObj(obj, { instantiator: instantiator })
    
    expect(convertedObj).to.not.be.undefined
    expect(convertedObj.a).to.equal('a')
    expect(convertedObj.b).to.be.instanceOf(Array)
    expect(convertedObj.b.length).to.equal(4)
    expect(convertedObj.b[0]).to.be.instanceOf(TestClass1)
    expect(convertedObj.b[1]).to.equal('a')
    expect(convertedObj.b[2]).to.equal(1)
    expect(convertedObj.b[3]).to.be.instanceOf(TestClass2)
    expect(convertedObj.c).to.equal(1)
  })

  it('should create the corresponding class', function() {
    let jsonObj = {
      '@class': 'TestClass1',
      a: {
        '@class': 'TestClass6',
        a: '1'
      },
      b: [
        { '@class': 'TestClass6', a: '2' }
      ]
    }

    let obj = fromJsonObj(jsonObj, { converter: {
      'TestClass1': (jsonObj: any, options?: FromJsonObjOptions) => {
        let obj = new TestClass1
        fillJsonObj(obj, jsonObj, options)
        return obj
      },
      'TestClass6': (jsonObj: any) => {
        let obj = new TestClass4
        obj.a = 'a' + jsonObj.a
        return obj
      }
    }})

    expect(obj).to.be.instanceOf(TestClass1)
    expect(obj.a).to.be.instanceOf(TestClass4)
    expect(obj.a.a).to.equal('a1')
    expect(obj.b).to.be.instanceOf(Array)
    expect(obj.b.length).to.equal(1)
    expect(obj.b[0]).to.be.instanceOf(TestClass4)
    expect(obj.b[0].a).to.equal('a2')
  })

  it('should use fillJsonObj method if available', function() {
    let jsonObj = { 
      '@class': 'TestClass3',
      a: 'a'
    }

    let obj = fromJsonObj(jsonObj, { instantiator: instantiator })

    expect(obj.a).to.equal('aa')
  })

  it('should just return null if the given value was null', function() {
    let obj = fromJsonObj(null)
    expect(obj).to.be.null
  })

  it('should be able to convert a JSON string', function() {
    let json = JSON.stringify({ testProp: 'testProp' })
    let obj = fromJsonObj(json)
    expect(obj.testProp).to.equal('testProp')
  })

  it('should convert a Date', function() {
    let date = new Date
    let jsonObj = {
      '@class': 'Date',
      date: date.toISOString()
    }

    let obj = fromJsonObj(jsonObj)

    expect(obj).to.be.instanceOf(Date)
    expect(obj.toISOString()).to.equal(date.toISOString())
  })

  it('should convert a BigInt', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: BigInt(3).toString()
    }

    let obj = fromJsonObj(jsonObj)

    expect(obj).to.be.a('bigint')
    expect(obj).to.equal(BigInt(3))
  })

  it('should convert a BigInt with undefined value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: undefined
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.be.undefined
  })

  it('should convert a BigInt with null value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: null
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.be.null
  })

  it('should convert a BigInt with true value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: true
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.equal(BigInt(1))
  })

  it('should convert a BigInt with false value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: false
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.equal(BigInt(0))
  })

  it('should convert a BigInt with an object value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: { b: 1 }
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.deep.equal({ b: 1 })
  })

  it('should convert a BigInt with an array value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: ['a', 1]
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.deep.equal(['a', 1])
  })

  it('should convert a BigInt with wrongly formatted string value', function() {
    let jsonObj = {
      '@class': 'BigInt',
      value: 'a'
    }

    let obj = fromJsonObj(jsonObj)
    expect(obj).to.equal('a')
  })
})

class TestClass1 {}
class TestClass2 {}

class TestClass3 {
  a!: string
  fillJsonObj(jsonObj: any) {
    this.a = jsonObj.a + 'a'
  }
}
class TestClass4 {
  a!: string
}

let instantiator = {
  'TestClass1': () => new TestClass1(),
  'TestClass2': () => new TestClass2(),
  'TestClass3': () => new TestClass3(),
  'TestClass4': () => new TestClass4()
}