class CreateSongs < ActiveRecord::Migration
  def change
    create_table :songs do |t|
      t.integer :sc_song_id, null: false
      t.string :title, null: false
      t.integer :duration, null: false

      t.timestamps null: false
    end
    add_index :songs, [:sc_song_id], unique: true
  end
end
