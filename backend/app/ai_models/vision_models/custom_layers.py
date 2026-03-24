"""
Custom layers for Vision Transformer (ViT) models.
IMPORTANT: These definitions must match exactly the training-time code.
"""

import tensorflow as tf
from tensorflow.keras import layers

# Image size used during training (required by PatchEmbedding)
IMG_SIZE = 224


@tf.keras.utils.register_keras_serializable(package="CustomLayers", name="PatchEmbedding")
class PatchEmbedding(layers.Layer):
    """Converts image patches and projects them into embedding space."""

    def __init__(self, patch_size, projection_dim, **kwargs):
        super().__init__(**kwargs)
        self.patch_size = patch_size
        self.projection_dim = projection_dim
        self.projection = layers.Dense(projection_dim)

    def call(self, images):
        batch_size = tf.shape(images)[0]
        num_patches = (IMG_SIZE // self.patch_size) ** 2

        patches = tf.image.extract_patches(
            images=images,
            sizes=[1, self.patch_size, self.patch_size, 1],
            strides=[1, self.patch_size, self.patch_size, 1],
            rates=[1, 1, 1, 1],
            padding="VALID"
        )

        patch_dim = patches.shape[-1]
        patches = tf.reshape(patches, [batch_size, num_patches, patch_dim])

        return self.projection(patches)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({
            "patch_size": self.patch_size,
            "projection_dim": self.projection_dim
        })
        return cfg


@tf.keras.utils.register_keras_serializable(package="CustomLayers", name="PositionalEncoding")
class PositionalEncoding(layers.Layer):
    """Adds learned positional embeddings to patch embeddings."""

    def __init__(self, num_patches, projection_dim=None, **kwargs):
        super().__init__(**kwargs)
        self.num_patches = num_patches
        self.projection_dim = projection_dim
        # Only create position_embedding if projection_dim is provided
        # Otherwise it will be created in build()
        if projection_dim is not None:
            self.position_embedding = layers.Embedding(
                input_dim=num_patches, output_dim=projection_dim
            )

    def build(self, input_shape):
        # If position_embedding wasn't created in __init__, create it now
        if not hasattr(self, 'position_embedding'):
            # Infer projection_dim from input shape
            self.projection_dim = int(input_shape[-1])
            self.position_embedding = layers.Embedding(
                input_dim=self.num_patches, output_dim=self.projection_dim
            )
        super().build(input_shape)

    def call(self, x):
        positions = tf.range(start=0, limit=self.num_patches, delta=1)
        return x + self.position_embedding(positions)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"num_patches": self.num_patches})
        # Include projection_dim if it was set
        if self.projection_dim is not None:
            cfg.update({"projection_dim": self.projection_dim})
        return cfg

    @classmethod
    def from_config(cls, config):
        # Extract num_patches and projection_dim (if present) from config
        num_patches = config.pop("num_patches", None)
        projection_dim = config.pop("projection_dim", None)
        # Create instance with remaining config (name, dtype, trainable, etc.)
        return cls(num_patches=num_patches, projection_dim=projection_dim, **config)
