import domready from "domready"
import "./style.css"
import fastRandom from "fast-random"


const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

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

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, width, height);

        const max = Math.max(width, height)
        const size = Math.min(width, height) / 10

        const cx = 0 | width * 0.5
        const cy = 0 | height * 0.5

        let flag = false;
        for (let r = size; r < max; r += size)
        {

            const count = Math.floor(TAU * size / size) * 4

            const step = TAU / count;
            for (let angle = 0; angle < TAU; angle += step)
            {
                ctx.fillStyle = flag ? "rgba(255,0,255, 0.5)" : "rgba(255,255,255, 0.5)"
                flag = !flag

                let nx = Math.cos(angle);
                let ny = Math.sin(angle);
                const xs = cx + nx * r;
                const ys = cy + ny * r;

                let h

                h = nx;
                nx = -ny;
                ny = h;

                ctx.beginPath();
                let x0 = xs + nx * size / 2;
                let y0 = ys + ny * size / 2;
                ctx.moveTo(x0, y0)

                h = -nx;
                nx = ny;
                ny = h;

                x0 += nx * size;
                y0 += ny * size;
                ctx.lineTo(x0, y0)

                h = -nx;
                nx = ny;
                ny = h;

                x0 += nx * size;
                y0 += ny * size;
                ctx.lineTo(x0, y0)

                h = -nx;
                nx = ny;
                ny = h;

                x0 += nx * size;
                y0 += ny * size;
                ctx.lineTo(x0, y0)

                h = -nx;
                nx = ny;
                ny = h;

                x0 += nx * size;
                y0 += ny * size;
                ctx.lineTo(x0, y0)
                ctx.fill()
            }
        }
    }
);
