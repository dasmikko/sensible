#!/usr/bin/env zx

import pkg from './package.json'
import { $ } from 'zx'

console.log('Clearing old rpms')
await $`rm -rf ./rpms`

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
