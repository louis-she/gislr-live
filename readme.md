# A Live Demo of Google - Isolated Sign Language Recognition

Here is a live demo to try the Google Isolated Sign Language Recognition model inference with video you can try out.

To use your own model, you should change the model path in the source code. I may will add a model selector in the future. In any case, you should export your model to the `tfjs` format, with the `tensorflowjs_converter` tool, for more information, take a look https://www.tensorflow.org/js/tutorials/conversion/import_saved_model .

```bash
tensorflowjs_converter \
    --input_format=tf_saved_model \
    --output_node_names="gislr" \
    --saved_model_tags=serve \
    $the_tensorflow_model_dir $output_dir
```

You can try a live demo with my model (LB 0.7) here: https://chenglu.me/gislr-live

**Setup and Run the demo**

before you go, please change the model path in `/src/sign-language-recognition.jsx`

```bash
pnpm install
pnpm run dev
```
