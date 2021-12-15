import domready from "domready"
import "./style.css"

import palettes from "./colors-all.json"
import weightedRandom from "./weightedRandom";


const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

const G = 1.2; // gravitational acceleration
const M = 1.0; // mass
const L = 1.0; // length
const dtMax = 30.0; // ms
//const tailMax = 400; // tail length

const barWidth = 0.04;
const barLength = 0.23;
const massRadius = 0.035;
//const tailThickness = 0.012;

const tmp = [0, 0, 0, 0]


function derivative(a1, a2, p1, p2)
{
    let ml2 = M * L * L;
    let cos12 = Math.cos(a1 - a2);
    let sin12 = Math.sin(a1 - a2);
    let da1 = 6 / ml2 * (2 * p1 - 3 * cos12 * p2) / (16 - 9 * cos12 * cos12);
    let da2 = 6 / ml2 * (8 * p2 - 3 * cos12 * p1) / (16 - 9 * cos12 * cos12);
    let dp1 = ml2 / -2 * (+da1 * da2 * sin12 + 3 * G / L * Math.sin(a1));
    let dp2 = ml2 / -2 * (-da1 * da2 * sin12 + 3 * G / L * Math.sin(a2));

    tmp[0] = da1
    tmp[1] = da2
    tmp[2] = dp1
    tmp[3] = dp2

    return tmp;
}


class Pendulum {
    cx = 0
    cy = 0
    d = 0
    a1 = 0
    a2 = 0
    p1 = 0
    p2 = 0
    prevX = undefined
    prevY = 0

    method = null


    constructor(palette, methods, crowd)
    {

        const {width, height} = config;

        const choice = 0 | Math.random() * 5;

        if (choice === 0)
        {
            this.cx = width / 2
            this.cy = height / 2
        }
        else
        {
            this.cx = width / 3 + (!(choice & 1)) * width / 3
            this.cy = height / 3 + (choice > 2) * height / 3

        }
        const rnd = Math.random();
        this.d = (Math.min(width, height) * barLength) * (crowd + Math.pow(rnd, 0.3));

        this.a1 = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
        this.a2 = Math.random() * Math.PI / 2 + Math.PI * 3 / 4;
        this.p1 = 0.0;
        this.p2 = 0.0;

        this.methods = methods
        this.method = methods()
    }


    //tail: tail,
    state()
    {
        return [this.a1, this.a2, this.p1, this.p2];
    }


    positions()
    {
        let x1 = +Math.sin(this.a1);
        let y1 = -Math.cos(this.a1);
        let x2 = +Math.sin(this.a2) + x1;
        let y2 = -Math.cos(this.a2) + y1;
        return [x1, y1, x2, y2];
    }


    step(dt)
    {

        this.rk4(dt);
    }


    rk4(dt)
    {
        const k1a1 = this.a1
        const k1a2 = this.a2
        const k1p1 = this.p1
        const k1p2 = this.p2

        let [k1da1, k1da2, k1dp1, k1dp2] = derivative(k1a1, k1a2, k1p1, k1p2);

        let k2a1 = k1a1 + k1da1 * dt / 2;
        let k2a2 = k1a2 + k1da2 * dt / 2;
        let k2p1 = k1p1 + k1dp1 * dt / 2;
        let k2p2 = k1p2 + k1dp2 * dt / 2;

        let [k2da1, k2da2, k2dp1, k2dp2] = derivative(k2a1, k2a2, k2p1, k2p2);

        let k3a1 = k1a1 + k2da1 * dt / 2;
        let k3a2 = k1a2 + k2da2 * dt / 2;
        let k3p1 = k1p1 + k2dp1 * dt / 2;
        let k3p2 = k1p2 + k2dp2 * dt / 2;

        let [k3da1, k3da2, k3dp1, k3dp2] = derivative(k3a1, k3a2, k3p1, k3p2);

        let k4a1 = k1a1 + k3da1 * dt;
        let k4a2 = k1a2 + k3da2 * dt;
        let k4p1 = k1p1 + k3dp1 * dt;
        let k4p2 = k1p2 + k3dp2 * dt;

        let [k4da1, k4da2, k4dp1, k4dp2] = derivative(k4a1, k4a2, k4p1, k4p2);

        this.a1 = k1a1 + (k1da1 + 2 * k2da1 + 2 * k3da1 + k4da1) * dt / 6,
            this.a2 = k1a2 + (k1da2 + 2 * k2da2 + 2 * k3da2 + k4da2) * dt / 6,
            this.p1 = k1p1 + (k1dp1 + 2 * k2dp1 + 2 * k3dp1 + k4dp1) * dt / 6,
            this.p2 = k1p2 + (k1dp2 + 2 * k2dp2 + 2 * k3dp2 + k4dp2) * dt / 6
    }


    draw2d(ctx)
    {
        const {width, height} = config;

        let {cx, cy, d, lineWidth} = this
        let x0 = Math.sin(this.a1) * d + cx;
        let y0 = Math.cos(this.a1) * d + cy;
        let x1 = Math.sin(this.a2) * d + x0;
        let y1 = Math.cos(this.a2) * d + y0;
        ctx.strokeStyle = "#f00";
        ctx.lineJoin = "bevel"

        const lwh = lineWidth / 2;

        const {prevX, prevY} = this;

        if (prevX !== undefined)
        {
            ctx.lineWidth = lineWidth
            ctx.beginPath();
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(x1, y1)
            ctx.stroke()

        }

        this.prevX = x1;
        this.prevY = y1;
    }

    newMethod()
    {
        this.method = this.methods()
        this.prevX = undefined
        this.prevY = undefined

    }
}


/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;


function wrap(number)
{
    const n = number / TAU - (number / TAU | 0);
    return n < 0 ? TAU + n * TAU : n * TAU;
}


const timeStep = 5;

domready(
    () => {
        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;




        const paint = () => {
            const palette = palettes[0 | Math.random() * palettes.length];
            const numPendula = Math.round(3 + Math.random() * 2)

            const methods = weightedRandom([
                // stroke
                Math.random(), () => {

                    const lineWidth = Math.round(2 + Math.random() * 25)
                    const rnd = Math.random();
                    const len = 2 + Math.pow(rnd, 0.1) * 100
                    const end = len + 10 + Math.random() * 100

                    let count = 0;
                    ctx.strokeStyle = palette[0 | Math.random() * palette.length]
                    return (pendulum => {

                        count++;

                        if ( count <= len)
                        {

                            let { cx, cy, d } = pendulum
                            let x0 = Math.sin(pendulum.a1) * d + cx;
                            let y0 = Math.cos(pendulum.a1) * d + cy;
                            let x1 = Math.sin(pendulum.a2) * d + x0;
                            let y1 = Math.cos(pendulum.a2) * d + y0;

                            const {prevX, prevY} = pendulum;
                            if (prevX !== undefined)
                            {
                                ctx.beginPath()
                                ctx.lineWidth = lineWidth
                                ctx.lineJoin = "bevel"
                                ctx.lineWidth = lineWidth
                                ctx.beginPath();
                                ctx.moveTo(prevX - (x1 - prevX) * 0.1 , prevY - (y1 - prevY) * 0.1)
                                ctx.lineTo(x1, y1)
                                ctx.stroke()
                            }
                            pendulum.prevX = x1;
                            pendulum.prevY = y1;

                            return false;
                        }
                        else {
                            return count > end;
                        }
                    });
                },
                // multi - stroke
                Math.random(), () => {

                    const lineWidth = Math.round(2 + Math.random() * 25)
                    const len = 40 + Math.random() * 40
                    const gap = 2 + Math.random() * 10
                    const repeat = Math.round(3 + Math.random() * 5)
                    const total = (len + gap) * repeat

                    const end = total + 200 + Math.random() * 100
                    ctx.strokeStyle = palette[0 | Math.random() * palette.length]

                    let count = 0;
                    return (pendulum => {

                        count++;

                        if ( count < total)
                        {
                            const pos = count % (len + gap)

                            let { cx, cy, d } = pendulum
                            let x0 = Math.sin(pendulum.a1) * d + cx;
                            let y0 = Math.cos(pendulum.a1) * d + cy;
                            let x1 = Math.sin(pendulum.a2) * d + x0;
                            let y1 = Math.cos(pendulum.a2) * d + y0;

                            if (pos < len)
                            {

                                const {prevX, prevY} = pendulum;
                                if (prevX !== undefined)
                                {
                                    ctx.beginPath()
                                    ctx.lineWidth = lineWidth
                                    ctx.lineJoin = "bevel"
                                    ctx.lineWidth = lineWidth
                                    ctx.beginPath();
                                    ctx.moveTo(prevX - (x1 - prevX) * 0.1 , prevY - (y1 - prevY) * 0.1)
                                    ctx.lineTo(x1, y1)
                                    ctx.stroke()
                                }
                            }
                            pendulum.prevX = x1;
                            pendulum.prevY = y1;

                            return false;
                        }
                        else {
                            return count > end;
                        }
                    });
                },
                // splat
                Math.random(), () => {

                    const rnd = Math.random();
                    let size = 5 + Math.pow(rnd, 0.1) * 120
                    const repeat = Math.round(3 + Math.random() * 2)
                    let speed = 0.5 + Math.random() * 2

                    return (pendulum => {

                        let { cx, cy, d, prevX, prevY } = pendulum
                        let x0 = Math.sin(pendulum.a1) * d + cx;
                        let y0 = Math.cos(pendulum.a1) * d + cy;
                        let x1 = Math.sin(pendulum.a2) * d + x0;
                        let y1 = Math.cos(pendulum.a2) * d + y0;

                        if (prevX !== undefined)
                        {
                            const dx = x1 - prevX
                            const dy = y1 - prevY

                            const len = Math.sqrt(dx + dx + dy * dy)
                            const nx = -dx * 4/len
                            const ny = dy * 20/len

                            ctx.fillStyle = palette[0 | Math.random() * palette.length]

                            for (let i = 0; i < repeat; i++)
                            {
                                ctx.beginPath()
                                ctx.moveTo(x1 + size,y1)
                                ctx.arc(x1,y1, size, 0, TAU, true)
                                ctx.fill();

                                x1 += dx * speed + nx * Math.random()
                                y1 += dy * speed + ny * Math.random()

                                size /= PHI

                                if (size < 1)
                                {
                                    break;
                                }
                            }


                            return true;
                        }

                        pendulum.prevX = x1;
                        pendulum.prevY = y1;

                        return false;
                    });
                },
            ])

            const pendula = []

            const crowd = 0.1 + Math.random()
            for (let i = 0; i < numPendula; i++)
            {
                pendula.push(new Pendulum(palette, methods,crowd))
            }

            ctx.fillStyle = Math.random() < 0.5 ? palette[0 | Math.random() * palette.length] : "#fff";
            ctx.fillRect(0, 0, width, height);

            let dt = timeStep;

            const count = 2000 + Math.random() * 3000
            for (let i = 0; i < count; i++)
            {
                for (let j = 0; j < pendula.length; j++)
                {
                    const pendulum = pendula[j];
                    pendulum.step(dt / 1000.0);
                    const result = pendulum.method(pendulum);
                    if (result)
                    {
                        pendulum.newMethod()
                    }
                }
            }
        }
        paint()

        window.addEventListener("click", paint, true)

    }
);


