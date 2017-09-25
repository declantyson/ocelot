# Ocelot

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8c4098372ae64f12b81f08b8f58ba372)](https://www.codacy.com/app/declantyson/ocelot?utm_source=github.com&utm_medium=referral&utm_content=declantyson/ocelot&utm_campaign=badger)
[![npm version](https://badge.fury.io/js/ocelot-pjax.svg)](https://badge.fury.io/js/ocelot-pjax)

Introducing Ocelot, the elegant way to make your sites quick, simple and beautiful using PJAX. Ocelot only updates the content of a specified element using AJAX but is designed with beautiful transitions and standard browser navigation in mind.

- Get started in two lines of code.
- Use transition animations, or don't.
- Get rid of hash navigation.
 
## Using Ocelot

A formal example is in the works. For now, here is how to make every single anchor a PJAX link.

```
    let ocelot = new Ocelot.Pjax("content");
    ocelot.all();
```

Congratulatons, your entire site is now completely PJAX-able.

Spice things up a bit with a fade:

```
    ocelot.fadeAll();
```

### Why shouldn't I just use AJAX?

Visit the [legacy example site](http://declantyson.github.io/pjaxit/) for a brief overview of what PJAX is and why it's awesome. A more interesting example will come soon.

### What happened to PJAXIT?

This is PjaxIt evolved to make the process even easier. It's cleaner, more modern and contains built in functions to get you up and running faster than ever.

Legacy PjaxIt is still available if you want higher flexibility but will no longer be maintained.
