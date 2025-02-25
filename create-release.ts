#!/usr/bin/env bun

import pkg from './package.json'
import { $ } from 'zx'

console.log('Clearing old package files')
await $`rm -rf ./packages`

console.log('Building sensible')
await $`bun build:exe`
$.verbose = true
$.nothrow = true

console.log(`Creating RPM package for sensible version ${pkg.version}`)
await $`fpm -t rpm -v ${pkg.version}`

console.log(`Creating DEB package for sensible version ${pkg.version}`)
await $`fpm -t deb -v ${pkg.version}`


console.log('Moving packages to packages folder')
await $`mkdir packages`
await $`mv *.rpm packages/`
await $`mv *.deb packages/`

console.log('Create github release')
await $`gh release create 0.1.2 ./packages/* --generate-notes`