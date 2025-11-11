// https://web.archive.org/web/20220706180035/https://code.tutsplus.com/tutorials/an-introduction-to-the-device-orientation-api--cms-21067
// https://web.archive.org/web/20240228232046/https://dev.opera.com/articles/w3c-device-orientation-usage/
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.erudaOrientation = factory()
  }
})(this, function () {
  return function (eruda) {
    var Tool = eruda.Tool
    var util = eruda.util

    var degtorad = Math.PI / 180

    function convertToRotationMatrix(alpha, beta, gamma) {
      var _x = beta * degtorad
      var _y = gamma * degtorad
      var _z = alpha * degtorad

      var cX = Math.cos(_x)
      var cY = Math.cos(_y)
      var cZ = Math.cos(_z)
      var sX = Math.sin(_x)
      var sY = Math.sin(_y)
      var sZ = Math.sin(_z)

      // ZXY-ordered rotation matrix construction.

      var m11 = cZ * cY - sZ * sX * sY
      var m12 = -cX * sZ
      var m13 = cY * sZ * sX + cZ * sY

      var m21 = cY * sZ + cZ * sX * sY
      var m22 = cZ * cX
      var m23 = sZ * sY - cZ * cY * sX

      var m31 = -cX * sY
      var m32 = sX
      var m33 = cX * cY

      // prettier-ignore
      return [
        m11, m12, m13,
        m21, m22, m23,
        m31, m32, m33
      ]
    }

    function getScreenOrientationRotationMatrix(screenOrientation) {
      var orientationAngle = screenOrientation * degtorad

      var cA = Math.cos(orientationAngle)
      var sA = Math.sin(orientationAngle)

      // prettier-ignore
      return [
        cA, -sA, 0,
        sA, cA, 0,
        0, 0, 1
      ]
    }

    function matrixMultiply(a, b) {
      return [
        a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
        a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
        a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

        a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
        a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
        a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

        a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
        a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
        a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
      ]
    }

    function computeCubeRotationMatrix(alpha, beta, gamma) {
      var rotationMatrix = convertToRotationMatrix(-alpha, -beta, gamma)

      var screenTransform = getScreenOrientationRotationMatrix(
        (screen.orientation && screen.orientation.angle) || 0
      )
      var screenAdjustedMatrix = matrixMultiply(rotationMatrix, screenTransform)

      return screenAdjustedMatrix
    }

    function convertRotationMatrixToTransform(r) {
      // prettier-ignore
      return [
        r[0], r[1], r[2], 0,
        r[3], r[4], r[5], 0,
        r[6], r[7], r[8], 0,
        0, 0, 0, 1,
      ]
    }

    function convertRotationMatrixToCssTransform(rotationMatrix) {
      var transformMatrix = convertRotationMatrixToTransform(rotationMatrix)
      return 'matrix3d(' + transformMatrix.join(', ') + ')'
    }

    var Orientation = Tool.extend({
      name: 'orientation',
      init: function ($el) {
        this.callSuper(Tool, 'init', arguments)
        this._style = util.evalCss(
          [
            '.eruda-dev-tools .eruda-tools .eruda-orientation {padding: 10px; overflow-y: auto; -webkit-overflow-scrolling: touch;}',
            '.eruda-not-supported {background: var(--console-error-background); color: var(--console-error-foreground); border: 1px solid var(--console-error-border);padding: 10px; text-align: center;}',
            '.eruda-cube {width: 150px; height: 150px; color: var(--foreground); position: relative; margin: 50px auto; -webkit-transform-style: preserve-3d; transform-style: preserve-3d;}',
            '.eruda-face {width: 150px; height: 150px; position: absolute; font-size: 80px; text-align: center; line-height: 150px; background-color: var(--accent); border: 1px solid var(--border); opacity: 0.6; }',
            '.eruda-one {-webkit-transform: translateZ(75px); transform: translateZ(75px);}',
            '.eruda-two {-webkit-transform: rotateY(90deg) translateZ(75px); transform: rotateY(90deg) translateZ(75px);}',
            '.eruda-three {-webkit-transform: rotateY(180deg) translateZ(75px); transform: rotateY(180deg) translateZ(75px);}',
            '.eruda-four {-webkit-transform: rotateY(-90deg) translateZ(75px); transform: rotateY(-90deg) translateZ(75px);}',
            '.eruda-five {-webkit-transform: rotateX(90deg) translateZ(75px); transform: rotateX(90deg) translateZ(75px);}',
            '.eruda-six {-webkit-transform: rotateX(-90deg) translateZ(75px) rotate(0deg); transform: rotateX(-90deg) translateZ(75px) rotate(0deg);}',
            '.eruda-orientation-data {margin: 10px;}',
            '.eruda-content {padding: 10px;}',
            'table {width: 100%;}',
            'table td {border: 1px solid var(--border); padding: 10px;}',
            '.eruda-key {width: 150px;}',
            'sup {vertical-align: super; font-size: smaller;}',
          ].join('.eruda-dev-tools .eruda-tools .eruda-orientation ')
        )
        var isSupported =
          window.DeviceOrientationEvent && window.DeviceMotionEvent

        if (!isSupported) {
          $el.html(
            '<div class="eruda-not-supported">Not supported for this browser!</div>'
          )
        } else {
          $el.html(
            [
              '<div class="eruda-cube" class="cube">',
              '  <div class="eruda-face eruda-one">1</div>',
              '  <div class="eruda-face eruda-two">2</div>',
              '  <div class="eruda-face eruda-three">3</div>',
              '  <div class="eruda-face eruda-four">4</div>',
              '  <div class="eruda-face eruda-five">5</div>',
              '  <div class="eruda-face eruda-six">6</div>',
              '</div>',
              '<div class="eruda-orientation-data">',
              '  <div class="eruda-content">',
              '    <table>',
              '      <tbody>',
              '        <tr>',
              '          <td class="eruda-key">coordinates</td>',
              '          <td class="eruda-coordinates">unknown</td>',
              '        </tr>',
              '        <tr>',
              '          <td class="eruda-key">acceleration</td>',
              '          <td class="eruda-acceleration">unknown</td>',
              '        </tr>',
              '        <tr>',
              '          <td class="eruda-key">acceleration including gravity</td>',
              '          <td class="eruda-acceleration-including-gravity">unknown</td>',
              '        </tr>',
              '        <tr>',
              '          <td class="eruda-key">rotation rate</td>',
              '          <td class="eruda-rotation-rate">unknown</td>',
              '        </tr>',
              '        <tr>',
              '          <td class="eruda-key">interval</td>',
              '          <td class="eruda-interval">unknown</td>',
              '        </tr>',
              '      </tbody>',
              '    </table>',
              '  </div>',
              '</div>',
            ].join('')
          )
          this._$cube = $el.find('.eruda-cube')
          this._$coordinates = $el.find('.eruda-coordinates')
          this._$acceleration = $el.find('.eruda-acceleration')
          this._$accGravity = $el.find('.eruda-acceleration-including-gravity')
          this._$rotationRate = $el.find('.eruda-rotation-rate')
          this._$interval = $el.find('.eruda-interval')
          this._bindEvent()
        }
      },
      _bindEvent: function () {
        var $cube = this._$cube
        var $coordinates = this._$coordinates
        var $acceleration = this._$acceleration
        var $accGravity = this._$accGravity
        var $rotationRate = this._$rotationRate
        var $interval = this._$interval

        var self = this
        this._onDeviceorientation = function (e) {
          if (!self._isShow) return

          var matrix = computeCubeRotationMatrix(e.alpha, e.beta, e.gamma)
          $cube.css('transform', convertRotationMatrixToCssTransform(matrix))

          $coordinates.text(
            '(' +
              Math.round(e.beta) +
              ', ' +
              Math.round(e.gamma) +
              ', ' +
              Math.round(e.alpha) +
              ')'
          )
        }
        this._onDevicemotion = function (e) {
          if (!self._isShow) return

          var acceleration = e.acceleration
          $acceleration.html(
            '(' +
              Math.round(acceleration.x) +
              ', ' +
              Math.round(acceleration.y) +
              ', ' +
              Math.round(acceleration.z) +
              ') m/s<sup>2</sup>'
          )

          var accGravity = e.accelerationIncludingGravity
          $accGravity.html(
            '(' +
              Math.round(accGravity.x) +
              ', ' +
              Math.round(accGravity.y) +
              ', ' +
              Math.round(accGravity.z) +
              ') m/s<sup>2</sup>'
          )

          var rotationRate = e.rotationRate
          $rotationRate.text(
            '(' +
              Math.round(rotationRate.beta) +
              ', ' +
              Math.round(rotationRate.gamma) +
              ', ' +
              Math.round(rotationRate.alpha) +
              ')'
          )

          $interval.text(e.interval + 'ms')
        }

        function bind(type) {
          var Event = DeviceOrientationEvent
          var eventName = 'deviceorientation'
          var listener = self._onDeviceorientation
          if (type === 'motion') {
            Event = DeviceMotionEvent
            eventName = 'devicemotion'
            listener = self._onDevicemotion
          }

          function requestPermission() {
            Event.requestPermission().then(function (response) {
              if (response === 'granted') {
                $cube.off('click', requestPermission)
              }
            })
          }
          if (Event.requestPermission) {
            $cube.on('click', requestPermission)
          }
          window.addEventListener(eventName, listener)
        }

        bind('orientation')
        bind('motion')
      },
      show: function () {
        this.callSuper(Tool, 'show', arguments)
        this._isShow = true
      },
      hide: function () {
        this.callSuper(Tool, 'hide', arguments)
        this._isShow = false
      },
      destroy: function () {
        this.callSuper(Tool, 'destroy', arguments)
        util.evalCss.remove(this._style)
        window.removeEventListener(
          'deviceorientation',
          this._onDeviceorientation
        )
        window.removeEventListener('devicemotion', this._onDevicemotion)
      },
    })

    return new Orientation()
  }
})
